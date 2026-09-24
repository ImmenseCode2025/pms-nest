DROP PROCEDURE IF EXISTS sp_get_parking_tickets;

DELIMITER $$

CREATE PROCEDURE sp_get_parking_tickets(
    IN p_page        INT,
    IN p_limit       INT,
    IN p_search      VARCHAR(100),
    IN p_site_id     INT,
    IN p_vehicle_type INT,
    IN p_device_type  VARCHAR(50),
    IN p_start_date  VARCHAR(50),
    IN p_end_date    VARCHAR(50)
)
BEGIN
    DECLARE v_offset INT;
    DECLARE v_fetch_limit INT;
    DECLARE v_search VARCHAR(120) DEFAULT NULL;
    DECLARE v_start  VARCHAR(50)  DEFAULT NULL;
    DECLARE v_end    VARCHAR(50)  DEFAULT NULL;
    DECLARE v_device VARCHAR(50)  DEFAULT NULL;
    DECLARE v_has_filters BOOLEAN;

    -- Sanitize page/limit & compute offset
    SET p_page  = IFNULL(NULLIF(p_page, 0), 1);
    SET p_limit = IFNULL(NULLIF(p_limit, 0), 10);
    SET v_offset = (p_page - 1) * p_limit;
    SET v_fetch_limit = v_offset + p_limit;

    IF p_search IS NOT NULL AND TRIM(p_search) != '' THEN
        SET v_search = CONCAT('%', TRIM(p_search), '%');
    END IF;

    IF p_start_date IS NOT NULL AND TRIM(p_start_date) != '' THEN
        SET v_start = TRIM(p_start_date);
    END IF;

    IF p_end_date IS NOT NULL AND TRIM(p_end_date) != '' THEN
        SET v_end = TRIM(p_end_date);
    END IF;

    IF p_device_type IS NOT NULL AND TRIM(p_device_type) != '' THEN
        SET v_device = LOWER(TRIM(p_device_type));
    END IF;

    SET v_has_filters = (v_search IS NOT NULL OR p_site_id IS NOT NULL OR p_vehicle_type IS NOT NULL OR v_start IS NOT NULL OR v_end IS NOT NULL);

    -- =========================================================================
    -- Result Set 1: Paginated Rows (with Vehicle Type & FOC Check)
    -- =========================================================================
    SELECT * FROM (
        (
            -- System Tokens
            SELECT 
                pt.id AS id,
                'System' AS source,
                pt.tokenNumber AS slip_number,
                pt.carNo AS vehicle_number,
                ps.id AS site_id,
                ps.name AS site_name,
                vt.id AS vehicle_type_id,
                vt.name AS vehicle_type,
                CASE 
                    WHEN COALESCE(pt.paymentMethod, 0) = 14 THEN 0.00 
                    ELSE COALESCE(pp.amount, 0.00) 
                END AS amount,
                pt.checkInDateTime AS check_in_date_time,
                pt.checkOutDateTime AS check_out_date_time,
                pt.status AS status,
                pm.name AS payment_method
            FROM parking_token pt
            INNER JOIN parking_site ps ON pt.site = ps.id
            LEFT JOIN vehicle_type vt ON vt.id = pt.vehicleType
            LEFT JOIN parking_price pp ON pp.vehicleType = pt.vehicleType AND pp.siteId = pt.site
            LEFT JOIN payment_method pm ON pm.id = pt.paymentMethod
            WHERE (v_device IS NULL OR v_device = 'system')
              AND (p_site_id IS NULL OR pt.site = p_site_id)
              AND (p_vehicle_type IS NULL OR pt.vehicleType = p_vehicle_type)
              AND (v_start IS NULL OR DATE(pt.checkInDateTime) >= DATE(v_start))
              AND (v_end   IS NULL OR DATE(pt.checkInDateTime) <= DATE(v_end))
              AND (v_search IS NULL
                   OR pt.tokenNumber LIKE v_search
                   OR pt.carNo       LIKE v_search
                   OR ps.name        LIKE v_search
                   OR vt.name        LIKE v_search)
            ORDER BY pt.checkInDateTime DESC
            LIMIT v_fetch_limit
        )
        UNION ALL
        (
            -- Handheld Receipts
            SELECT 
                pr.id AS id,
                CASE 
                    WHEN pr.sourceHandheld = 1 AND pr.sourceTicketEase = 1 THEN 'Handheld + TicketEase'
                    WHEN pr.sourceTicketEase = 1 THEN 'TicketEase'
                    ELSE 'Handheld'
                END AS source,
                COALESCE(pr.ticketNumber, CONCAT('REC-', pr.id)) AS slip_number,
                pr.vehicleNumber AS vehicle_number,
                ps.id AS site_id,
                ps.name AS site_name,
                vt.id AS vehicle_type_id,
                vt.name AS vehicle_type,
                CASE 
                    WHEN COALESCE(pr.paymentMethod, 0) = 14 THEN 0.00 
                    ELSE COALESCE(pp.amount, 0.00) 
                END AS amount,
                pr.creationDate AS check_in_date_time,
                pr.checkOutDateTime AS check_out_date_time,
                CASE WHEN pr.checkOutDateTime IS NULL THEN 'Active' ELSE 'Expired' END AS status,
                pm.name AS payment_method
            FROM parking_receipt pr
            INNER JOIN hardware hw ON pr.deviceId = hw.ipOrApi
            INNER JOIN parking_site ps ON hw.asignee = ps.id
            LEFT JOIN vehicle_type vt ON vt.id = pr.vehicleType
            LEFT JOIN parking_price pp ON pp.vehicleType = pr.vehicleType AND pp.siteId = ps.id
            LEFT JOIN payment_method pm ON pm.id = pr.paymentMethod
            WHERE (v_device IS NULL OR v_device = 'handheld')
              AND (p_site_id IS NULL OR ps.id = p_site_id)
              AND (p_vehicle_type IS NULL OR pr.vehicleType = p_vehicle_type)
              AND (v_start IS NULL OR DATE(pr.creationDate) >= DATE(v_start))
              AND (v_end   IS NULL OR DATE(pr.creationDate) <= DATE(v_end))
              AND (v_search IS NULL
                   OR pr.ticketNumber  LIKE v_search
                   OR pr.vehicleNumber LIKE v_search
                   OR ps.name          LIKE v_search
                   OR vt.name          LIKE v_search)
            ORDER BY pr.creationDate DESC
            LIMIT v_fetch_limit
        )
    ) AS combined
    ORDER BY check_in_date_time DESC
    LIMIT p_limit OFFSET v_offset;

    -- =========================================================================
    -- Result Set 2: Total Count
    -- =========================================================================
    IF NOT v_has_filters THEN
        IF (v_device = 'system') THEN
            SELECT COUNT(1) AS total_count FROM parking_token;
        ELSEIF (v_device = 'handheld') THEN
            SELECT COUNT(1) AS total_count FROM parking_receipt;
        ELSE
            SELECT (SELECT COUNT(1) FROM parking_token) + (SELECT COUNT(1) FROM parking_receipt) AS total_count;
        END IF;
    ELSE
        SELECT
            (
                CASE WHEN (v_device IS NULL OR v_device = 'system') THEN
                    (
                        SELECT COUNT(1)
                        FROM parking_token pt
                        INNER JOIN parking_site ps ON pt.site = ps.id
                        LEFT JOIN vehicle_type vt ON vt.id = pt.vehicleType
                        WHERE (p_site_id IS NULL OR pt.site = p_site_id)
                          AND (p_vehicle_type IS NULL OR pt.vehicleType = p_vehicle_type)
                          AND (v_start IS NULL OR DATE(pt.checkInDateTime) >= DATE(v_start))
                          AND (v_end   IS NULL OR DATE(pt.checkInDateTime) <= DATE(v_end))
                          AND (v_search IS NULL
                               OR pt.tokenNumber LIKE v_search
                               OR pt.carNo       LIKE v_search
                               OR ps.name        LIKE v_search
                               OR vt.name        LIKE v_search)
                    )
                ELSE 0 END
            )
            +
            (
                CASE WHEN (v_device IS NULL OR v_device = 'handheld') THEN
                    (
                        SELECT COUNT(1)
                        FROM parking_receipt pr
                        INNER JOIN hardware hw ON pr.deviceId = hw.ipOrApi
                        INNER JOIN parking_site ps ON hw.asignee = ps.id
                        LEFT JOIN vehicle_type vt ON vt.id = pr.vehicleType
                        WHERE (p_site_id IS NULL OR ps.id = p_site_id)
                          AND (p_vehicle_type IS NULL OR pr.vehicleType = p_vehicle_type)
                          AND (v_start IS NULL OR DATE(pr.creationDate) >= DATE(v_start))
                          AND (v_end   IS NULL OR DATE(pr.creationDate) <= DATE(v_end))
                          AND (v_search IS NULL
                               OR pr.ticketNumber  LIKE v_search
                               OR pr.vehicleNumber LIKE v_search
                               OR ps.name          LIKE v_search
                               OR vt.name          LIKE v_search)
                    )
                ELSE 0 END
            )
        AS total_count;
    END IF;

END $$

DELIMITER ;
