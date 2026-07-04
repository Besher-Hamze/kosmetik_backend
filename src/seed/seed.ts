/**
 * Idempotent seed script — safe to re-run.
 * Usage: npm run seed
 */
import 'reflect-metadata';
import * as bcrypt from 'bcryptjs';
import { randomInt } from 'crypto';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';
import mongoose from 'mongoose';
import { join } from 'path';
import { AlbumSchema } from '../modules/gallery/schemas/album.schema';
import { CertificateSchema } from '../modules/certificates/schemas/certificate.schema';
import {
  ContentKey,
  ContentSchema,
} from '../modules/content/schemas/content.schema';
import { CourseSchema } from '../modules/courses/schemas/course.schema';
import { FaqSchema } from '../modules/faqs/schemas/faq.schema';
import { NavigationSchema } from '../modules/navigation/schemas/navigation.schema';
import { PageSchema } from '../modules/pages/schemas/page.schema';
import { SettingsSchema } from '../modules/settings/schemas/settings.schema';
import { TestimonialSchema } from '../modules/testimonials/schemas/testimonial.schema';
import { TreatmentSchema } from '../modules/treatments/schemas/treatment.schema';
import { UserSchema } from '../modules/users/schemas/user.schema';

dotenv.config();

interface Localized {
  de: string;
  ar: string;
}

interface SeedContent {
  settings: Record<string, unknown>;
  homepage: Record<string, unknown>;
  treatments: Array<Record<string, unknown> & { slug: string }>;
  coursesIntro: Record<string, unknown>;
  courses: Array<Record<string, unknown> & { slug: string }>;
  about: Record<string, unknown>;
  legalPages: Array<Record<string, unknown> & { slug: string }>;
  faqs: Array<Record<string, unknown> & { question: Localized }>;
  navigation: Record<string, unknown>;
  gallery: Array<
    Record<string, unknown> & {
      slug: string;
      images: Array<Record<string, unknown>>;
    }
  >;
}

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function generateCertCode(): string {
  let random = '';
  for (let i = 0; i < 5; i += 1) {
    random += CODE_CHARS[randomInt(CODE_CHARS.length)];
  }
  return `KK-${new Date().getFullYear()}-${random}`;
}

async function main(): Promise<void> {
  const uri =
    process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/kosmetik';
  await mongoose.connect(uri);
  console.log(`Connected to ${uri}`);

  const content = JSON.parse(
    readFileSync(join(process.cwd(), 'seed', 'content.json'), 'utf-8'),
  ) as SeedContent;

  const UserModel = mongoose.model('User', UserSchema);
  const TreatmentModel = mongoose.model('Treatment', TreatmentSchema);
  const CourseModel = mongoose.model('Course', CourseSchema);
  const ContentModel = mongoose.model('Content', ContentSchema);
  const PageModel = mongoose.model('Page', PageSchema);
  const SettingsModel = mongoose.model('Settings', SettingsSchema);
  const NavigationModel = mongoose.model('Navigation', NavigationSchema);
  const FaqModel = mongoose.model('Faq', FaqSchema);
  const TestimonialModel = mongoose.model('Testimonial', TestimonialSchema);
  const AlbumModel = mongoose.model('Album', AlbumSchema);
  const CertificateModel = mongoose.model('Certificate', CertificateSchema);

  const summary: string[] = [];

  // 1. Admin user
  const adminEmail = (
    process.env.ADMIN_EMAIL ?? 'admin@karmen-kosmetik.de'
  ).toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'Admin#2026';
  await UserModel.findOneAndUpdate(
    { email: adminEmail },
    {
      $set: {
        email: adminEmail,
        passwordHash: await bcrypt.hash(adminPassword, 12),
        name: 'Administrator',
        role: 'superadmin',
        isActive: true,
      },
    },
    { upsert: true },
  );
  summary.push(`admin user: ${adminEmail} (superadmin)`);

  // 2. Treatments
  for (const raw of content.treatments) {
    const name = raw.name as Localized;
    const description = raw.description as Localized;
    const excerpt = raw.excerpt as Localized;
    const treatment = {
      ...raw,
      sections: (raw.sections as unknown[] | undefined) ?? [
        {
          heading: {
            de: `Was ist ${name.de}?`,
            ar: `ما هي ${name.ar}؟`,
          },
          body: description,
        },
        {
          heading: {
            de: 'Wie funktioniert die Behandlung?',
            ar: 'كيف تتم المعالجة؟',
          },
          body: excerpt,
        },
      ],
      gallery:
        (raw.gallery as unknown[] | undefined) ??
        (raw.image ? [{ src: raw.image as string, alt: name }] : []),
      beforeAfter: (raw.beforeAfter as unknown[] | undefined) ?? [],
      isPublished: true,
    };
    await TreatmentModel.findOneAndUpdate(
      { slug: treatment.slug },
      { $set: treatment },
      { upsert: true },
    );
  }
  summary.push(`treatments: ${content.treatments.length}`);

  // 3. Courses
  for (const course of content.courses) {
    await CourseModel.findOneAndUpdate(
      { slug: course.slug },
      { $set: { ...course, isPublished: true } },
      { upsert: true },
    );
  }
  summary.push(`courses: ${content.courses.length}`);

  // 4. Content docs
  const contentDocs: Array<[ContentKey, Record<string, unknown>]> = [
    ['homepage', content.homepage],
    ['courses-intro', content.coursesIntro],
    ['about', content.about],
  ];
  for (const [key, data] of contentDocs) {
    await ContentModel.findOneAndUpdate(
      { key },
      { $set: { key, data } },
      { upsert: true },
    );
  }
  summary.push(`content docs: ${contentDocs.map(([k]) => k).join(', ')}`);

  // 5. Legal pages
  for (const page of content.legalPages) {
    await PageModel.findOneAndUpdate(
      { slug: page.slug },
      { $set: page },
      { upsert: true },
    );
  }
  summary.push(`pages: ${content.legalPages.map((p) => p.slug).join(', ')}`);

  // 6. Settings (singleton)
  await SettingsModel.findOneAndUpdate(
    {},
    { $set: content.settings },
    { upsert: true },
  );
  summary.push('settings: 1 (singleton)');

  // 7. Navigation (singleton)
  await NavigationModel.findOneAndUpdate(
    {},
    { $set: content.navigation },
    { upsert: true },
  );
  summary.push('navigation: 1 (singleton)');

  // 8. FAQs (keyed by German question text for idempotency)
  for (const faq of content.faqs) {
    await FaqModel.findOneAndUpdate(
      { 'question.de': faq.question.de },
      { $set: { ...faq, isPublished: true } },
      { upsert: true },
    );
  }
  summary.push(`faqs: ${content.faqs.length}`);

  // 9. Gallery albums
  for (const [index, album] of content.gallery.entries()) {
    await AlbumModel.findOneAndUpdate(
      { slug: album.slug },
      {
        $set: {
          ...album,
          order: index + 1,
          images: album.images.map((image, imageIndex) => ({
            ...image,
            order: imageIndex + 1,
          })),
        },
      },
      { upsert: true },
    );
  }
  summary.push(
    `gallery albums: ${content.gallery.map((a) => a.slug).join(', ')}`,
  );

  // 10. Sample testimonials
  const testimonials = [
    {
      name: 'Sarah M.',
      text: {
        de: 'Die Schulung in der Karmen Kosmetik Akademie war hervorragend — kleine Gruppen, viel Praxis und eine persönliche Betreuung. Ich habe mich vom ersten Tag an gut aufgehoben gefühlt.',
        ar: 'كانت الدورة في أكاديمية كارمن كوزماتيك ممتازة — مجموعات صغيرة وتطبيق عملي كثير ومتابعة شخصية. شعرت بالاهتمام منذ اليوم الأول.',
      },
      rating: 5,
      source: 'website' as const,
      isApproved: true,
      order: 1,
    },
    {
      name: 'Lina K.',
      text: {
        de: 'Sehr professionelle Ausbildung mit Theorie und Praxis. Dank der Schulung auf Deutsch und Arabisch konnte ich alle Inhalte problemlos verstehen. Absolut empfehlenswert!',
        ar: 'تدريب احترافي جداً يجمع بين النظري والعملي. بفضل التدريس باللغتين الألمانية والعربية فهمت كل المحتوى بسهولة. أنصح به بشدة!',
      },
      rating: 5,
      source: 'website' as const,
      isApproved: true,
      order: 2,
    },
    {
      name: 'Aya H.',
      text: {
        de: 'Nach dem Permanent Make-up Kurs konnte ich direkt selbstständig arbeiten. Die Trainerin nimmt sich viel Zeit und die Hygienestandards in der Akademie sind top.',
        ar: 'بعد دورة المكياج الدائم استطعت العمل بشكل مستقل مباشرة. المدربة تمنح وقتاً كافياً لكل متدربة ومعايير النظافة في الأكاديمية ممتازة.',
      },
      rating: 5,
      source: 'website' as const,
      isApproved: true,
      order: 3,
    },
  ];
  for (const testimonial of testimonials) {
    await TestimonialModel.findOneAndUpdate(
      { name: testimonial.name, source: 'website' },
      { $set: testimonial },
      { upsert: true },
    );
  }
  summary.push(`testimonials: ${testimonials.length} (approved samples)`);

  // 11. Sample certificate (PMU course) for verification demo
  const studentName = 'Beispiel Teilnehmerin';
  let certificate = await CertificateModel.findOne({ studentName });
  if (!certificate) {
    certificate = await CertificateModel.create({
      code: generateCertCode(),
      studentName,
      courseName: {
        de: 'Permanent Make-Up / Microblading',
        ar: 'دورة المكياج الدائم والمايكروبليدينغ',
      },
      courseSlug: 'permanent-make-up-microblading',
      issueDate: new Date(),
      expiryDate: null,
      pdfUrl: '',
      isValid: true,
    });
  }
  summary.push(`certificate: ${certificate.code} (${studentName})`);

  console.log('\nSeed complete:');
  for (const line of summary) console.log(`  - ${line}`);
  console.log(`\nCertificate verification code: ${certificate.code}`);

  await mongoose.disconnect();
}

main().catch((err: Error) => {
  console.error('Seed failed:', err);
  process.exitCode = 1;
});
