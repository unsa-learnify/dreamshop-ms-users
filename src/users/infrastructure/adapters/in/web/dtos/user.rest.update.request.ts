import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class UserRestUpdateRequest {
  @IsOptional()
  @IsString()
  @Length(2, 32)
  readonly firstname: string;
  @IsOptional()
  @IsString()
  @Length(2, 32)
  readonly lastname: string;
  @IsOptional()
  @IsString()
  @IsEmail()
  @Length(1, 64)
  readonly email: string;
  @IsOptional()
  @IsBoolean()
  readonly isActive: boolean;
}
