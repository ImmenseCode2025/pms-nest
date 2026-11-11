DROP PROCEDURE IF EXISTS sp_general_inquiry;

DELIMITER $$

CREATE PROCEDURE sp_general_inquiry(
    IN p_page        INT,
    IN p_limit       INT,
    IN p_search_text VARCHAR(100),
    IN p_type        VARCHAR(20)   -- 'vehicle' | 'ticket'
)
BEGIN
    DECLARE v_offset INT;
    DECLARE v_fetch_limit INT;
    DECLARE v_search VARCHAR(120);
    DECLARE v_type   VARCHAR(20);

    SET p_page  = IFNULL(NULLIF(p_page, 0), 1);
    SET p_limit = IFNULL(NULLIF(p_limit, 0), 10);
    SET v_offset = (p_page - 1) * p_limit;
    SET v_fetch_limit = v_offset + p_limit;

    SET v_search = CONCAT('%', TRIM(p_search_text), '%');
    SET v_type   = LOWER(TRIM(p_type));

    -- =========================================================================
    -- Result Set 1: Paginated Rows
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
                pm.name AS payment_method,
                CAST(NULL AS JSON) AS check_in_operator,
                NULL AS handheld_device
            FROM parking_token pt
            INNER JOIN parking_site ps ON pt.site = ps.id
            LEFT JOIN vehicle_type vt ON vt.id = pt.vehicleType
            LEFT JOIN parking_price pp ON pp.vehicleType = pt.vehicleType AND pp.siteId = pt.site
            LEFT JOIN payment_method pm ON pm.id = pt.paymentMethod
            WHERE (v_type = 'vehicle' AND pt.carNo       LIKE v_search)
               OR (v_type = 'ticket'  AND pt.tokenNumber LIKE v_search)
            ORDER BY pt.checkInDateTime DESC
            LIMIT v_fetch_limit
        )
        UNION ALL
        (
            -- Handheld Receipts
            SELECT
                pr.id AS id,
                'Handheld' AS source,
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
                pm.name AS payment_method,
                CASE
                    WHEN op.id IS NULL THEN NULL
                    ELSE JSON_OBJECT('id', op.id, 'name', op.username)
                END AS check_in_operator,
                pr.deviceId AS handheld_device
            FROM parking_receipt pr
            INNER JOIN parking_site ps ON pr.siteId = ps.id
            LEFT JOIN vehicle_type vt ON vt.id = pr.vehicleType
            LEFT JOIN parking_price pp ON pp.vehicleType = pr.vehicleType AND pp.siteId = ps.id
            LEFT JOIN payment_method pm ON pm.id = pr.paymentMethod
            LEFT JOIN operators op ON op.id = pr.checkInOperatorId
            WHERE (v_type = 'vehicle' AND pr.vehicleNumber LIKE v_search)
               OR (v_type = 'ticket'  AND pr.ticketNumber  LIKE v_search)
            ORDER BY pr.creationDate DESC
            LIMIT v_fetch_limit
        )
    ) AS combined
    ORDER BY check_in_date_time DESC
    LIMIT p_limit OFFSET v_offset;

    -- =========================================================================
    -- Result Set 2: Total Count
    -- =========================================================================
    SELECT
        (
            SELECT COUNT(1)
            FROM parking_token pt
            INNER JOIN parking_site ps ON pt.site = ps.id
            WHERE (v_type = 'vehicle' AND pt.carNo       LIKE v_search)
               OR (v_type = 'ticket'  AND pt.tokenNumber LIKE v_search)
        )
        +
        (
            SELECT COUNT(1)
            FROM parking_receipt pr
            INNER JOIN parking_site ps ON pr.siteId = ps.id
            WHERE (v_type = 'vehicle' AND pr.vehicleNumber LIKE v_search)
               OR (v_type = 'ticket'  AND pr.ticketNumber  LIKE v_search)
        )
    AS total_count;

END $$

DELIMITER ;
