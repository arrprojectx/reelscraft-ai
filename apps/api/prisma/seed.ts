import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { config } from '../config/env';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

const DEFAULT_TEMPLATES = [
  {
    name: 'Jualan Produk Soft Selling',
    slug: 'jualan-produk-soft-selling',
    category: 'jualan',
    platform: 'tiktok',
    contentStyle: 'soft-selling',
    duration: '30-45',
    structureJson: {
      hook: 'Pembuka yang menarik perhatian dalam 3 detik',
      script: 'Script edukatif yang mengarah ke produk',
      caption: 'Caption yang menarik dan engaging',
      hashtags: ['#hashtag1', '#hashtag2'],
      storyboard: 'Deskripsi storyboard berdasarkan scene',
    },
  },
  {
    name: 'Affiliate Review',
    slug: 'affiliate-review',
    category: 'review',
    platform: 'reels',
    contentStyle: 'review',
    duration: '45-60',
    structureJson: {
      hook: 'Hook review yang menarik',
      script: 'Review lengkap produk',
      caption: 'Caption affiliate dengan CTA',
      hashtags: ['#review', '#affiliate'],
      storyboard: 'Scene review produk',
    },
  },
  {
    name: 'Edukasi Tips',
    slug: 'edukasi-tips',
    category: 'edukasi',
    platform: 'shorts',
    contentStyle: 'edukasi',
    duration: '30-45',
    structureJson: {
      hook: 'Hook pembelajaran yang menarik',
      script: 'Tips edukatif berkualitas',
      caption: 'Caption edukatif',
      hashtags: ['#tips', '#edukasi'],
      storyboard: 'Scene pembelajaran',
    },
  },
];

async function main() {
  try {
    logger.info('Seeding database...');

    // Create default admin
    const adminPasswordHash = await bcrypt.hash(config.defaultAdminPassword, 10);
    const admin = await prisma.admin.upsert({
      where: { email: config.defaultAdminEmail },
      update: {},
      create: {
        name: config.defaultAdminName,
        email: config.defaultAdminEmail,
        passwordHash: adminPasswordHash,
        role: 'super_admin',
        isActive: true,
      },
    });

    logger.info(`Admin created: ${admin.email}`);

    // Create default templates
    for (const template of DEFAULT_TEMPLATES) {
      await prisma.contentTemplate.upsert({
        where: { slug: template.slug },
        update: {},
        create: {
          ...template,
          isActive: true,
          createdByAdminId: admin.id,
        },
      });
    }

    logger.info(`${DEFAULT_TEMPLATES.length} templates created`);

    // Create default settings
    const defaultSettings = [
      { key: 'app_name', value: config.appName, type: 'string', group: 'general', isPublic: true },
      { key: 'tagline', value: 'Generator Konten Video AI', type: 'string', group: 'general', isPublic: true },
      { key: 'theme', value: 'dark-premium', type: 'string', group: 'ui', isPublic: true },
      { key: 'maintenance_mode', value: 'false', type: 'boolean', group: 'general', isPublic: false },
    ];

    for (const setting of defaultSettings) {
      await prisma.setting.upsert({
        where: { key: setting.key },
        update: {},
        create: setting,
      });
    }

    logger.info('Default settings created');
    logger.info('Database seeding completed successfully!');
  } catch (error) {
    logger.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
