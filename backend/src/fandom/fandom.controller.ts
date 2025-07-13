import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UploadedFile,
  UseInterceptors,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { FandomService } from './fandom.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { ApiTags, ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { CreateFandomDto } from './create-fandom.dto';
import { Response } from 'express';

const uploadPath = process.env.FANDOM_IMAGE_UPLOAD_PATH || 'uploads/fandoms';

@ApiTags('Fandom')
@Controller('fandoms')
export class FandomController {
  constructor(private readonly fandomService: FandomService) {
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
  }

  @Get()
  @ApiOperation({ summary: 'Получить список фандомов' })
  findAll() {
    return this.fandomService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Создать фандом' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateFandomDto })
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        // Имя файла временное, после создания фандома переименуем
        const ext = path.extname(file.originalname);
        const tempName = `temp-${Date.now()}${ext}`;
        cb(null, tempName);
      },
    }),
  }))
  async create(
    @Body() body: CreateFandomDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    // Сначала создаём фандом без картинки
    const fandom = await this.fandomService.create(body.name, '');
    // Формируем имя файла: id.расширение
    const ext = path.extname(file.originalname);
    const newFileName = `${fandom.id}${ext}`;
    const newFilePath = path.join(uploadPath, newFileName);
    // Переименовываем файл
    fs.renameSync(file.path, newFilePath);
    // Формируем url ручки
    const imageUrl = `/fandoms/${fandom.id}/image`;
    // Обновляем url картинки в БД
    fandom.image_url = imageUrl;
    await this.fandomService.updateImageUrl(fandom.id, imageUrl);
    return fandom;
  }

  @Get(':id/image')
  @ApiOperation({ summary: 'Получить картинку фандома по id' })
  async getImage(@Param('id') id: number, @Res() res: Response) {
    // Ищем фандом
    const fandom = await this.fandomService.findOne(id);
    if (!fandom || !fandom.image_url) {
      throw new NotFoundException('Фандом или картинка не найдены');
    }
    // Картинка должна называться id.расширение
    const files = fs.readdirSync(uploadPath);
    const fileName = files.find(f => f.startsWith(`${id}.`));
    if (!fileName) {
      throw new NotFoundException('Картинка не найдена');
    }
    const filePath = path.join(uploadPath, fileName);
    res.sendFile(path.resolve(filePath));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить фандом' })
  async remove(@Param('id') id: number) {
    await this.fandomService.remove(id);
    // Удаляем картинку
    const files = fs.readdirSync(uploadPath);
    const fileName = files.find(f => f.startsWith(`${id}.`));
    if (fileName) {
      fs.unlinkSync(path.join(uploadPath, fileName));
    }
    return { success: true };
  }
} 