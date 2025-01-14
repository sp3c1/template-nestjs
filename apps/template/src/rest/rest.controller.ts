import { PubSubEngine } from 'graphql-subscriptions';

import { User } from '@app/common/coreModels';
import {
  Body,
  Controller,
  Get,
  Headers,
  Inject,
  Param,
  Post,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import {
  ApiHeader,
  ApiOkResponse,
  ApiProperty,
} from '@nestjs/swagger';

import {
  AllowedRoles,
  Roles,
} from '../auth';
import { UserService } from '../gql/user/user.service';

export class CreateUserDto {
  @ApiProperty({
    description: 'The email address of the user',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'The full name of the user',
    example: 'John Doe',
  })
  name: string;
}

@Controller('api')
export class RestController {
  constructor(@Inject('PUB_SUB') private pubSub: PubSubEngine, private userService: UserService) {}

  @Get('app')
  @ApiOkResponse({
    description: 'Echoes back the provider',
    schema: {
      type: 'string',
      example: 'Hello World!',
    },
  })
  getHello(): string {
    return 'Hello World!';
  }

  @Post('webhook/:provider')
  @ApiOkResponse({
    description: 'Echoes back the provider',
    schema: {
      type: 'string',
      example: 'github',
    },
  })
  @ApiHeader({
    name: 'x-api-key',
    description: 'API Key required for authentication',
    required: true,
  })
  @Roles([AllowedRoles.All])
  webhooke(
    @Param('provider') provider: string,
    @Headers('x-api-key') apiKey: string,
    @Req() request: RawBodyRequest<Request>
  ): string {
    return provider;
  }

  @Post('user/')
  @ApiOkResponse({
    description: 'Echoes back the provider',
    schema: {
      type: 'string',
      example: 'github',
    },
  })
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @Req() request: RawBodyRequest<Request>
  ): Promise<User> {
    const newUser = new User();
    newUser.email = createUserDto.email;
    newUser.name = createUserDto.name;

    await this.userService.insert(newUser);
    this.pubSub.publish('user-created', newUser).finally();
    return <User>{
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
    };
  }
}
