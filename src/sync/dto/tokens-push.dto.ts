import { ArrayMaxSize, IsArray, IsInt, IsNotEmpty } from 'class-validator';

// Site server ka ek token (local `tokens` row)
export interface PushedToken {
  uuid: string;
  version: number;
  local_id: number;
  token_number: string | null;
  vehicle_number: string | null;
  vehicle_type_id: number | null;
  payment_method_id: number | null;
  check_in_operator_id: number | null;
  check_out_operator_id: number | null;
  check_in_at: string | null; // ISO (UTC)
  check_out_at: string | null; // ISO (UTC)
  amount: number | string | null;
  status: 'INSIDE' | 'COMPLETED' | null;
}

export class TokensPushDto {
  @IsNotEmpty()
  @IsInt()
  site_id: number;

  @IsArray()
  @ArrayMaxSize(1000)
  records: PushedToken[];
}
