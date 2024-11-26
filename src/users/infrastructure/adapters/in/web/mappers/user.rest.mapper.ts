import { User } from 'src/users/domain/models/user.model';
import { UserRestResponse } from '../dtos/user.rest.response';
import { UserRestCreateRequest } from '../dtos/user.rest.create.request';
import { UserRestUpdateRequest } from '../dtos/user.rest.update.request';

export class UserRestMapper {
  static domainToResponse(user: User): UserRestResponse {
    return new UserRestResponse(
      user.getId,
      user.getFirstname,
      user.getLastname,
      user.getUsername,
      user.getEmail,
      user.getActive,
      user.getRoles.map((role) => role.getName),
    );
  }
  static createRequestToDomain(
    userRestCreateRequest: UserRestCreateRequest,
  ): User {
    return new User(
      null,
      userRestCreateRequest.firstname,
      userRestCreateRequest.lastname,
      userRestCreateRequest.username,
      userRestCreateRequest.email,
      userRestCreateRequest.password,
      true,
      null,
    );
  }
  static updateRequestToDomain(
    userRestUpdateRequest: UserRestUpdateRequest,
  ): User {
    return new User(
      null,
      userRestUpdateRequest.firstname,
      userRestUpdateRequest.lastname,
      null,
      userRestUpdateRequest.email,
      null,
      userRestUpdateRequest.isActive,
      null,
    );
  }
}
