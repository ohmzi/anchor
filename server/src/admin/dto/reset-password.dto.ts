import { IsOptional, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsOptional()
  @MinLength(6)
  newPassword?: string;
}

