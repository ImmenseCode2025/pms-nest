DROP PROCEDURE IF EXISTS sp_get_admin_dashboard;

DELIMITER $$

CREATE PROCEDURE sp_get_admin_dashboard(
    IN p_company_id INT,
    IN p_site_id INT,
    IN p_payment_method INT,
    IN p_vehicle_type INT,
    IN p_start_date VARCHAR(50),
    IN p_end_date VARCHAR(50)
)
BEGIN
    DECLARE v_start_date VARCHAR(50) DEFAULT NULL;
    DECLARE v_end_date VARCHAR(50) DEFAULT NULL;
 
    IF p_start_date IS NOT NULL AND TRIM(p_start_date) != '' THEN
        SET v_start_date = TRIM(p_start_date);
    END IF;
 
    IF p_end_date IS NOT NULL AND TRIM(p_end_date) != '' THEN
        SET v_end_date = TRIM(p_end_date);
    END IF;
 
    -- 1. Total Sites
    SELECT COUNT(DISTINCT ps.id) AS total_sites
    FROM parking_site ps
    WHERE (p_company_id IS NULL OR ps.company = p_company_id)
      AND (p_site_id IS NULL OR ps.id = p_site_id);
 
    -- 2. Vehicle Types Breakdown (Total Parking, Total FOC, Total Revenue)
    SELECT 
        v.vehicle_type_id AS id,
        v.vehicle_type_name AS name,
        SUM(v.total_parking) AS totalParking,
        SUM(v.total_foc) AS totalFoc,
        SUM(v.total_revenue) AS totalRevenue
    FROM (
        SELECT 
            pt.vehicleType AS vehicle_type_id,
            vt.name AS vehicle_type_name,
            COUNT(1) AS total_parking,
            SUM(CASE WHEN COALESCE(pt.paymentMethod, 0) = 14 THEN 1 ELSE 0 END) AS total_foc,
            SUM(CASE 
                WHEN COALESCE(pt.paymentMethod, 0) = 14 THEN 0
                WHEN pt.checkOutDateTime IS NOT NULL 
                     AND TIMESTAMPDIFF(MINUTE, pt.checkInDateTime, pt.checkOutDateTime) > 15 
                THEN COALESCE(pp.amount, 0) 
                ELSE 0 
            END) AS total_revenue
        FROM parking_token pt
        INNER JOIN parking_site ps ON pt.site = ps.id
        LEFT JOIN vehicle_type vt ON vt.id = pt.vehicleType
        LEFT JOIN parking_price pp ON pp.vehicleType = pt.vehicleType AND pp.siteId = pt.site
        WHERE (p_company_id IS NULL OR ps.company = p_company_id)
          AND (p_site_id IS NULL OR pt.site = p_site_id)
          AND (p_payment_method IS NULL OR pt.paymentMethod = p_payment_method)
          AND (p_vehicle_type IS NULL OR pt.vehicleType = p_vehicle_type)
          AND (v_start_date IS NULL OR DATE(pt.checkInDateTime) >= DATE(v_start_date))
          AND (v_end_date IS NULL OR DATE(pt.checkInDateTime) <= DATE(v_end_date))
          AND pt.vehicleType IS NOT NULL
        GROUP BY pt.vehicleType, vt.name
        UNION ALL
        SELECT 
            pr.vehicleType AS vehicle_type_id,
            vt.name AS vehicle_type_name,
            COUNT(1) AS total_parking,
            SUM(CASE WHEN COALESCE(pr.paymentMethod, 0) = 14 THEN 1 ELSE 0 END) AS total_foc,
            SUM(CASE 
                WHEN COALESCE(pr.paymentMethod, 0) = 14 THEN 0
                ELSE COALESCE(pp.amount, 0)
            END) AS total_revenue
        FROM parking_receipt pr
        INNER JOIN hardware hw ON pr.deviceId = hw.ipOrApi
        INNER JOIN parking_site ps ON hw.asignee = ps.id
        LEFT JOIN vehicle_type vt ON vt.id = pr.vehicleType
        LEFT JOIN parking_price pp ON pp.vehicleType = pr.vehicleType AND pp.siteId = ps.id
        WHERE (p_company_id IS NULL OR ps.company = p_company_id)
          AND (p_site_id IS NULL OR ps.id = p_site_id)
          AND (p_payment_method IS NULL OR pr.paymentMethod = p_payment_method)
          AND (p_vehicle_type IS NULL OR pr.vehicleType = p_vehicle_type)
          AND (v_start_date IS NULL OR DATE(pr.creationDate) >= DATE(v_start_date))
          AND (v_end_date IS NULL OR DATE(pr.creationDate) <= DATE(v_end_date))
          AND pr.vehicleType IS NOT NULL
        GROUP BY pr.vehicleType, vt.name
    ) v
    GROUP BY v.vehicle_type_id, v.vehicle_type_name
    ORDER BY totalParking DESC;
 
    -- 3. Daily Parking Trend
    SELECT 
        d.day AS label,
        SUM(d.total_count) AS value
    FROM (
        SELECT 
            DATE_FORMAT(pt.checkInDateTime, '%Y-%m-%d') AS day,
            COUNT(1) AS total_count
        FROM parking_token pt
        INNER JOIN parking_site ps ON pt.site = ps.id
        WHERE pt.checkInDateTime IS NOT NULL
          AND (p_company_id IS NULL OR ps.company = p_company_id)
          AND (p_site_id IS NULL OR pt.site = p_site_id)
          AND (p_payment_method IS NULL OR pt.paymentMethod = p_payment_method)
          AND (p_vehicle_type IS NULL OR pt.vehicleType = p_vehicle_type)
          AND (v_start_date IS NULL OR DATE(pt.checkInDateTime) >= DATE(v_start_date))
          AND (v_end_date IS NULL OR DATE(pt.checkInDateTime) <= DATE(v_end_date))
        GROUP BY day
        UNION ALL
        SELECT 
            DATE_FORMAT(pr.creationDate, '%Y-%m-%d') AS day,
            COUNT(1) AS total_count
        FROM parking_receipt pr
        INNER JOIN hardware hw ON pr.deviceId = hw.ipOrApi
        INNER JOIN parking_site ps ON hw.asignee = ps.id
        WHERE pr.creationDate IS NOT NULL
          AND (p_company_id IS NULL OR ps.company = p_company_id)
          AND (p_site_id IS NULL OR ps.id = p_site_id)
          AND (p_payment_method IS NULL OR pr.paymentMethod = p_payment_method)
          AND (p_vehicle_type IS NULL OR pr.vehicleType = p_vehicle_type)
          AND (v_start_date IS NULL OR DATE(pr.creationDate) >= DATE(v_start_date))
          AND (v_end_date IS NULL OR DATE(pr.creationDate) <= DATE(v_end_date))
        GROUP BY day
    ) d
    WHERE d.day IS NOT NULL
    GROUP BY d.day
    ORDER BY d.day ASC;
 
    -- 4. Recent Transactions (10 Latest)
    SELECT * FROM (
        (
            SELECT 
                pt.id AS id,
                'System' AS source,
                pt.tokenNumber AS slip_number,
                pt.carNo AS vehicle_number,
                ps.id AS site_id,
                ps.name AS site_name,
                vt.id AS vehicle_type_id,
                vt.name AS vehicle_type_name,
                (CASE 
                    WHEN COALESCE(pt.paymentMethod, 0) = 14 THEN 0.00 
                    ELSE COALESCE(pp.amount, 0.00) 
                END) AS amount,
                pt.checkInDateTime AS check_in_date_time,
                pt.checkOutDateTime AS check_out_date_time,
                pt.status AS status,
                pm.name AS payment_method
            FROM parking_token pt
            INNER JOIN parking_site ps ON pt.site = ps.id
            LEFT JOIN vehicle_type vt ON vt.id = pt.vehicleType
            LEFT JOIN parking_price pp ON pp.vehicleType = pt.vehicleType AND pp.siteId = pt.site
            LEFT JOIN payment_method pm ON pm.id = pt.paymentMethod
            WHERE (p_company_id IS NULL OR ps.company = p_company_id)
              AND (p_site_id IS NULL OR pt.site = p_site_id)
              AND (p_payment_method IS NULL OR pt.paymentMethod = p_payment_method)
              AND (p_vehicle_type IS NULL OR pt.vehicleType = p_vehicle_type)
              AND (v_start_date IS NULL OR DATE(pt.checkInDateTime) >= DATE(v_start_date))
              AND (v_end_date IS NULL OR DATE(pt.checkInDateTime) <= DATE(v_end_date))
            ORDER BY pt.checkInDateTime DESC
            LIMIT 10
        )
        UNION ALL
        (
            SELECT 
                pr.id AS id,
                (CASE 
                    WHEN pr.sourceHandheld = 1 AND pr.sourceTicketEase = 1 THEN 'Handheld + TicketEase'
                    WHEN pr.sourceTicketEase = 1 THEN 'TicketEase'
                    ELSE 'Handheld'
                END) AS source,
                COALESCE(pr.ticketNumber, CONCAT('REC-', pr.id)) AS slip_number,
                pr.vehicleNumber AS vehicle_number,
                ps.id AS site_id,
                ps.name AS site_name,
                vt.id AS vehicle_type_id,
                vt.name AS vehicle_type_name,
                (CASE 
                    WHEN COALESCE(pr.paymentMethod, 0) = 14 THEN 0.00 
                    ELSE COALESCE(pp.amount, 0.00) 
                END) AS amount,
                pr.creationDate AS check_in_date_time,
                pr.checkOutDateTime AS check_out_date_time,
                (CASE WHEN pr.checkOutDateTime IS NULL THEN 'Active' ELSE 'Expired' END) AS status,
                pm.name AS payment_method
            FROM parking_receipt pr
            INNER JOIN hardware hw ON pr.deviceId = hw.ipOrApi
            INNER JOIN parking_site ps ON hw.asignee = ps.id
            LEFT JOIN vehicle_type vt ON vt.id = pr.vehicleType
            LEFT JOIN parking_price pp ON pp.vehicleType = pr.vehicleType AND pp.siteId = ps.id
            LEFT JOIN payment_method pm ON pm.id = pr.paymentMethod
            WHERE (p_company_id IS NULL OR ps.company = p_company_id)
              AND (p_site_id IS NULL OR ps.id = p_site_id)
              AND (p_payment_method IS NULL OR pr.paymentMethod = p_payment_method)
              AND (p_vehicle_type IS NULL OR pr.vehicleType = p_vehicle_type)
              AND (v_start_date IS NULL OR DATE(pr.creationDate) >= DATE(v_start_date))
              AND (v_end_date IS NULL OR DATE(pr.creationDate) <= DATE(v_end_date))
            ORDER BY pr.creationDate DESC
            LIMIT 10
        )
    ) t
    ORDER BY t.check_in_date_time DESC
    LIMIT 10;
 
END $$

DELIMITER ;
