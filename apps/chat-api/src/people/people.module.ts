import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PasswordHasher } from './password-hasher.js';
import { PeopleRepository } from './people.repository.js';
import { PeopleService } from './people.service.js';
import { Person } from './person.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Person])],
  providers: [PeopleRepository, PeopleService, PasswordHasher],
  exports: [PeopleService, PasswordHasher],
})
export class PeopleModule {}
