import { IsEmail, IsString, Length } from 'class-validator';

export class UserRestCreateRequest {
  @IsString()
  @Length(2, 32)
  readonly firstname: string;
  @IsString()
  @Length(2, 32)
  readonly lastname: string;
  @IsString()
  @Length(2, 16)
  readonly username: string;
  @IsString()
  @IsEmail()
  @Length(1, 64)
  readonly email: string;
  @IsString()
  @Length(8, 32)
  readonly password: string;
}
