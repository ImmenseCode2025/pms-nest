import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { appendFileSync, existsSync, mkdirSync, readdirSync, unlinkSync } from 'fs';
import moment from 'moment';
import mysqldump from 'mysqldump';
import { join } from 'path';
import { ParkingToken } from 'src/core/orm/entities';

const BACKUP_DIR = join(process.cwd(), 'db-backup');
const BACKUP_PREFIX = 'pms-backup-';
const BACKUP_EXT = '.sql';
const BACKUPS_TO_KEEP = 2;

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  // Every night at 12:00 AM (Pakistan time)
  @Cron('0 0 * * *', { name: 'db-backup', timeZone: 'Asia/Karachi' })
  async dbBackup() {
    if (!existsSync(BACKUP_DIR)) {
      mkdirSync(BACKUP_DIR, { recursive: true });
    }

    const fileName = `${BACKUP_PREFIX}${moment().format('YYYY-MM-DD')}${BACKUP_EXT}`;
    const filePath = join(BACKUP_DIR, fileName);

    try {
      await mysqldump({
        connection: {
          host: process.env.DATABASE_HOST,
          port: Number(process.env.DATABASE_PORT || 3306),
          user: process.env.DATABASE_USER,
          password: process.env.DATABASE_PASSWORD,
          database: process.env.DATABASE_NAME,
        },
        dumpToFile: filePath,
      });

      // mysqldump package does not export stored procedures, so append them
      await this.appendStoredProcedures(filePath);

      this.logger.log(`DB backup created: ${filePath}`);
      this.removeOldBackups();
    } catch (error) {
      if (existsSync(filePath)) unlinkSync(filePath);
      this.logger.error(`DB backup failed: ${error.message}`);
    }
  }

  private async appendStoredProcedures(filePath: string) {
    const knex = ParkingToken.knex();
    const [procedures]: any = await knex.raw(
      `SHOW PROCEDURE STATUS WHERE Db = ?`,
      [process.env.DATABASE_NAME],
    );

    if (!procedures.length) return;

    let sql = '\n\n# ------------------------------------------------------------\n# STORED PROCEDURES\n# ------------------------------------------------------------\n\nDELIMITER $$\n\n';

    for (const proc of procedures) {
      const [rows]: any = await knex.raw(`SHOW CREATE PROCEDURE \`${proc.Name}\``);
      const createSql = rows[0]['Create Procedure'];
      sql += `DROP PROCEDURE IF EXISTS \`${proc.Name}\`$$\n${createSql}$$\n\n`;
    }

    sql += 'DELIMITER ;\n';
    appendFileSync(filePath, sql);
  }

  // Keep only the newest BACKUPS_TO_KEEP files; date in the name sorts correctly
  private removeOldBackups() {
    const backups = readdirSync(BACKUP_DIR)
      .filter((f) => f.startsWith(BACKUP_PREFIX) && f.endsWith(BACKUP_EXT))
      .sort()
      .reverse();

    for (const file of backups.slice(BACKUPS_TO_KEEP)) {
      unlinkSync(join(BACKUP_DIR, file));
      this.logger.log(`Old DB backup removed: ${file}`);
    }
  }
}
