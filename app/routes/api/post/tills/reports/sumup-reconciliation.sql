SELECT 
    t.date AS 'Date',
    t.transaction_id AS 'Transaction ID',
    JSON_EXTRACT(t.summary, '$.sumupId') AS 'SUMUP ID',
    CAST(JSON_EXTRACT(t.summary, '$.totals.money') AS DECIMAL(10,2)) AS 'Murakami Amount',
    
    -- For display purposes
    CASE 
        WHEN st_success.amount IS NOT NULL THEN CAST(st_success.amount AS DECIMAL(10,2))
        ELSE CAST(st.amount AS DECIMAL(10,2))
    END AS 'SUMUP Amount',
    
    -- Show both statuses when applicable
    CASE
        WHEN st_success.status IS NOT NULL AND st_refund.status IS NOT NULL 
            THEN CONCAT(st_success.status, ' & ', st_refund.status)
        ELSE st.status
    END AS 'SumUp Status',
    
    -- Show timestamp from SumUp
    st.timestamp AS 'SumUp Timestamp',
    
    CASE
        -- Handle the net transaction logic (successful minus refunded)
        WHEN st_success.status = 'SUCCESSFUL' AND st_refund.status = 'REFUNDED' AND 
             ABS(CAST(st_success.amount AS DECIMAL(10,2)) - CAST(st_refund.amount AS DECIMAL(10,2))) = 
             CAST(JSON_EXTRACT(t.summary, '$.totals.money') AS DECIMAL(10,2))
             THEN 'Net Transaction OK'
             
        WHEN st_success.status = 'SUCCESSFUL' AND st_refund.status = 'REFUNDED'
             THEN 'Net Amount mismatch'
             
        WHEN st.transaction_code IS NULL THEN 'Missing From Sumup'
        WHEN st.status NOT IN ('SUCCESSFUL', 'PENDING') THEN 'Failed in Sumup'
        WHEN CAST(JSON_EXTRACT(t.summary, '$.totals.money') AS DECIMAL(10,2)) != 
             CAST(st.amount AS DECIMAL(10,2)) THEN 'Amount mismatch'
    END AS 'Status'
FROM 
    transactions t
LEFT JOIN 
    sumup_transactions st ON JSON_EXTRACT(t.summary, '$.sumupId') = st.transaction_code
    
-- Join to get SUCCESSFUL transactions
LEFT JOIN 
    sumup_transactions st_success ON 
    JSON_EXTRACT(t.summary, '$.sumupId') = st_success.transaction_code AND 
    st_success.status = 'SUCCESSFUL'
    
-- Join to get REFUNDED transactions
LEFT JOIN 
    sumup_transactions st_refund ON 
    JSON_EXTRACT(t.summary, '$.sumupId') = st_refund.transaction_code AND 
    st_refund.status = 'REFUNDED'

WHERE 
    JSON_EXTRACT(t.summary, '$.sumupId') IS NOT NULL
    AND (
        -- No matching SumUp transaction
        st.transaction_code IS NULL
        
        -- Status isn't successful or pending
        OR (st_success.status IS NULL AND st.status NOT IN ('SUCCESSFUL', 'PENDING'))
        
        -- Simple amount mismatch (no refund situation)
        OR (st_refund.status IS NULL AND CAST(JSON_EXTRACT(t.summary, '$.totals.money') AS DECIMAL(10,2)) != 
            CAST(st.amount AS DECIMAL(10,2)))
            
        -- There's both successful and refunded, but net amount doesn't match
        OR (st_success.status = 'SUCCESSFUL' AND st_refund.status = 'REFUNDED' AND 
            ABS(CAST(st_success.amount AS DECIMAL(10,2)) - CAST(st_refund.amount AS DECIMAL(10,2))) != 
            CAST(JSON_EXTRACT(t.summary, '$.totals.money') AS DECIMAL(10,2)))
    )

UNION

SELECT 
    NULL AS 'Date',
    NULL AS 'Transaction ID',
    st.transaction_code AS 'SUMUP ID',
    NULL AS 'Murakami Amount',
    CAST(st.amount AS DECIMAL(10,2)) AS 'SUMUP Amount',
    st.status AS 'SumUp Status',
    st.timestamp AS 'SumUp Timestamp',
    'Missing from Murakami' AS 'Status'
FROM 
    sumup_transactions st
LEFT JOIN 
    transactions t ON st.transaction_code = JSON_EXTRACT(t.summary, '$.sumupId')
WHERE 
    JSON_EXTRACT(t.summary, '$.sumupId') IS NULL
    AND st.status IN ('SUCCESSFUL', 'PENDING')

ORDER BY Date DESC;