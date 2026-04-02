SET @phone_col_exists := (
	SELECT COUNT(*)
	FROM information_schema.COLUMNS
	WHERE TABLE_SCHEMA = DATABASE()
	  AND TABLE_NAME = 'users'
	  AND COLUMN_NAME = 'phone'
);

SET @phone_col_sql := IF(
	@phone_col_exists = 0,
	'ALTER TABLE users ADD COLUMN phone VARCHAR(20) NULL AFTER email',
	'SELECT 1'
);

PREPARE stmt_phone_col FROM @phone_col_sql;
EXECUTE stmt_phone_col;
DEALLOCATE PREPARE stmt_phone_col;

SET @phone_index_exists := (
	SELECT COUNT(*)
	FROM information_schema.STATISTICS
	WHERE TABLE_SCHEMA = DATABASE()
	  AND TABLE_NAME = 'users'
	  AND INDEX_NAME = 'uk_users_phone'
);

SET @phone_index_sql := IF(
	@phone_index_exists = 0,
	'ALTER TABLE users ADD CONSTRAINT uk_users_phone UNIQUE (phone)',
	'SELECT 1'
);

PREPARE stmt_phone_idx FROM @phone_index_sql;
EXECUTE stmt_phone_idx;
DEALLOCATE PREPARE stmt_phone_idx;
