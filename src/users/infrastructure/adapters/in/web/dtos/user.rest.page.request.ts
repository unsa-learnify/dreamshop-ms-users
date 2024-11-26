import { Transform } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

export class UserRestPageRequest {
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt({ message: 'page must be an integer number' })
  @Min(0, { message: 'page must be greater than or equal to 0' })
  page: number = 0;
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt({ message: 'size must be an integer number' })
  @Min(1, { message: 'size must be greater than or equal to 1' })
  @Max(100, { message: 'size must not be greater than 100' })
  size: number = 10;
}
