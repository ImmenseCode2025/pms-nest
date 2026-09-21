import { IsNotEmpty } from 'class-validator';

export class InboxTypingDto {
  @IsNotEmpty()
  inbox_id: number;

  @IsNotEmpty()
  user_id: number;
}
