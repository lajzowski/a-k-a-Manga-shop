import { ApiProperty } from '@nestjs/swagger';

export class CreateFandomDto {
  @ApiProperty({ description: 'Название фандома' })
  name: string;

  @ApiProperty({ type: 'string', format: 'binary', required: true, description: 'Картинка фандома' })
  image: any;
} 