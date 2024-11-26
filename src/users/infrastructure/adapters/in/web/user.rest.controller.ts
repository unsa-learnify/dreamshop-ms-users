import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { UserService } from 'src/users/application/services/user.service';
import { UserRestResponse } from './dtos/user.rest.response';
import { UserRestMapper } from './mappers/user.rest.mapper';
import { UserRestCreateRequest } from './dtos/user.rest.create.request';
import { UserRestUpdateRequest } from './dtos/user.rest.update.request';
import { Role } from 'src/users/domain/models/role.model';
import { UserRestPageRequest } from './dtos/user.rest.page.request';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('/api/v1/users')
@ApiTags('Users')
@ApiBearerAuth()
export class UserRestController {
  constructor(private readonly userService: UserService) {}
  @Post()
  async createOneUser(
    @Body() userRestCreateRequest: UserRestCreateRequest,
  ): Promise<UserRestResponse> {
    const user = await this.userService.createOneUser(
      UserRestMapper.createRequestToDomain(userRestCreateRequest),
    );
    return UserRestMapper.domainToResponse(user);
  }
  @Get()
  async findUsersByPage(
    @Query() userRestPageRequest: UserRestPageRequest,
  ): Promise<UserRestResponse[]> {
    const { page, size } = userRestPageRequest;
    const users = await this.userService.findUsersByPage(page, size);
    return users.map((user) => UserRestMapper.domainToResponse(user));
  }
  @Get(':userId')
  async findOneUserById(
    @Param('userId') userId: string,
  ): Promise<UserRestResponse> {
    const user = await this.userService.findOneUserById(userId);
    return UserRestMapper.domainToResponse(user);
  }
  @Patch(':userId')
  async updateOneUserById(
    @Param('userId') userId: string,
    @Body() userUpdateRequest: UserRestUpdateRequest,
  ): Promise<void> {
    const user = UserRestMapper.updateRequestToDomain(userUpdateRequest);
    await this.userService.updateOneUserById(userId, user);
  }
  @Patch(':userId/roles/:role')
  async addRoleByUserId(
    @Param('userId') userId: string,
    @Param('role') role: string,
  ): Promise<void> {
    await this.userService.assignRoleToUserById(userId, new Role(role));
  }
  @Delete(':userId')
  async deleteOneUserById(@Param('userId') userId: string): Promise<void> {
    await this.userService.deleteOneUserById(userId);
  }
  @Delete(':userId/roles/:role')
  async removeRoleByUserId(
    @Param('userId') userId: string,
    @Param('role') role: string,
  ): Promise<void> {
    await this.userService.revokeRoleFromUserById(userId, new Role(role));
  }
  @Get('/roles/:role')
  async getUsersByRoleAndPage(
    @Param('role') role: string,
    @Query() userRestPageRequest: UserRestPageRequest,
  ): Promise<UserRestResponse[]> {
    const { page, size } = userRestPageRequest;
    const users = await this.userService.findUsersByRoleAndPage(
      new Role(role),
      page,
      size,
    );
    return users.map((user) => UserRestMapper.domainToResponse(user));
  }
}
