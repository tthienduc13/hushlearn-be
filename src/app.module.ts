import { Module } from '@nestjs/common';
import generateModulesSet from '@/utils/modules-set.util';

@Module({
  imports: generateModulesSet(),
})
export class AppModule {}
