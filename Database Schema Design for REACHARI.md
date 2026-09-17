Database Schema Design for REACHARIS Backend
เอกสารนี้สรุปโครงสร้างฐานข้อมูล (Database Schema) และความสัมพันธ์ของตาราง (Relationships) ทั้งหมดสำหรับระบบ Backend ของเว็บไซต์ REACHARIS เพื่อให้ครอบคลุมทุก Flow การทำงาน (เนื้อหา, สินค้า, ผลงาน, ข่าวสาร และการติดต่อ) โดยออกแบบมาสำหรับการใช้งานร่วมกับ Prisma ORM (PostgreSQL)

📌 ภาพรวมของระบบ (System Flows)
CMS Flow (ระบบจัดการเนื้อหา): แอดมินสามารถเพิ่ม/แก้ไข สินค้า, ผลงาน, ข่าวสาร และบริการ
Contact & CRM Flow (ระบบติดต่อลูกค้า): เก็บข้อมูลจากฟอร์ม "ติดต่อเรา" และ "ขอใบเสนอราคา" เพื่อให้เซลล์ติดตามงานต่อได้
Authentication Flow: ระบบ Login สำหรับแอดมินจัดการระบบ
🗄️ Entity Relationship (ER) & Schema
1. User (แอดมินระบบ)
ใช้สำหรับจัดการสิทธิ์การเข้าถึง Backend

id (UUID, PK)
email (String, Unique)
password (String, Hashed)
name (String)
role (Enum: SUPER_ADMIN, EDITOR)
createdAt / updatedAt
Relations: 1 User สามารถเขียน News ได้หลายบทความ (1:M)
2. Product (สินค้า)
id (UUID, PK)
title (String) - เช่น "ตู้ควบคุมไฟฟ้า"
slug (String, Unique) - สำหรับ URL
description (Text)
features (Json / String[]) - จุดเด่นของสินค้า
coverImage (String)
isActive (Boolean) - เปิด/ปิดการแสดงผล
createdAt / updatedAt
Relations:
1 Product มี ProductImage ได้หลายรูป (1:M)
1 Product อาจถูกอ้างอิงใน QuoteRequest ได้หลายรายการ (1:M)
3. ProductImage (รูปภาพสินค้าเพิ่มเติม)
id (UUID, PK)
productId (UUID, FK -> Product.id)
imageUrl (String)
altText (String?)
displayOrder (Int)
4. Portfolio (ผลงานของเรา)
id (UUID, PK)
title (String)
slug (String, Unique)
clientName (String?)
description (Text)
coverImage (String)
completionDate (DateTime?)
categoryId (UUID, FK -> PortfolioCategory.id)
createdAt / updatedAt
Relations: 1 Portfolio อยู่ใน 1 PortfolioCategory (M:1)
5. PortfolioCategory (หมวดหมู่ผลงาน)
id (UUID, PK)
name (String) - เช่น "Electrical", "Water", "Industrial"
Relations: 1 PortfolioCategory มี Portfolio ได้หลายงาน (1:M)
6. News (ข่าวสารและกิจกรรม)
id (UUID, PK)
title (String)
slug (String, Unique)
content (Text) - เนื้อหาแบบ Rich Text / HTML
excerpt (String) - คำโปรย
coverImage (String)
authorId (UUID, FK -> User.id)
categoryId (UUID, FK -> NewsCategory.id)
isPublished (Boolean)
publishedAt (DateTime)
createdAt / updatedAt
7. NewsCategory (หมวดหมู่ข่าวสาร)
id (UUID, PK)
name (String) - เช่น "ข่าวองค์กร", "บทความความรู้"
Relations: 1 NewsCategory มี News ได้หลายบทความ (1:M)
8. QuoteRequest (รายการขอใบเสนอราคา / ติดต่อเรา)
ใช้เก็บข้อมูลจากหน้าบ้าน (Frontend) ทั้งจากฟอร์ม Contact และ Quote

id (UUID, PK)
type (Enum: QUOTE, CONTACT) - แยกประเภทคำขอ
name (String)
company (String?)
phone (String)
email (String?)
interestedProduct (String?) - เผื่อลูกค้าพิมพ์เอง
productId (UUID?, FK -> Product.id) - กรณีเลือกลิงก์กับสินค้าในระบบ
message (Text) - รายละเอียดเพิ่มเติม
status (Enum: PENDING, IN_PROGRESS, COMPLETED, REJECTED) - สถานะการติดตามงานของเซลล์
notes (Text?) - โน้ตภายในสำหรับเซลล์
createdAt / updatedAt
💻 ตัวอย่างโค้ด Prisma Schema (schema.prisma)
สามารถนำไปใช้ในโปรเจกต์ Backend ใหม่ได้เลย

prisma

generator client {
  provider = "prisma-client-js"
}
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
// ----------------------------------------------------
// ENUMS
// ----------------------------------------------------
enum Role {
  SUPER_ADMIN
  EDITOR
}
enum RequestType {
  QUOTE
  CONTACT
}
enum RequestStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  REJECTED
}
// ----------------------------------------------------
// MODELS
// ----------------------------------------------------
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String
  role      Role     @default(EDITOR)
  news      News[]   // Relation: 1 User -> Many News
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
model Product {
  id            String         @id @default(uuid())
  title         String
  slug          String         @unique
  description   String         @db.Text
  features      String[]       // Array of strings (PostgreSQL only)
  coverImage    String
  isActive      Boolean        @default(true)
  images        ProductImage[]
  quoteRequests QuoteRequest[]
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
}
model ProductImage {
  id           String  @id @default(uuid())
  product      Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  productId    String
  imageUrl     String
  altText      String?
  displayOrder Int     @default(0)
}
model PortfolioCategory {
  id         String      @id @default(uuid())
  name       String
  portfolios Portfolio[]
}
model Portfolio {
  id             String            @id @default(uuid())
  title          String
  slug           String            @unique
  clientName     String?
  description    String            @db.Text
  coverImage     String
  completionDate DateTime?
  category       PortfolioCategory @relation(fields: [categoryId], references: [id], onDelete: Restrict)
  categoryId     String
  createdAt      DateTime          @default(now())
  updatedAt      DateTime          @updatedAt
}
model NewsCategory {
  id   String @id @default(uuid())
  name String
  news News[]
}
model News {
  id          String       @id @default(uuid())
  title       String
  slug        String       @unique
  content     String       @db.Text
  excerpt     String?      @db.Text
  coverImage  String?
  author      User         @relation(fields: [authorId], references: [id])
  authorId    String
  category    NewsCategory @relation(fields: [categoryId], references: [id], onDelete: Restrict)
  categoryId  String
  isPublished Boolean      @default(false)
  publishedAt DateTime?
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}
model QuoteRequest {
  id                String        @id @default(uuid())
  type              RequestType   @default(CONTACT)
  name              String
  company           String?
  phone             String
  email             String?
  interestedProduct String?
  product           Product?      @relation(fields: [productId], references: [id], onDelete: SetNull)
  productId         String?
  message           String?       @db.Text
  status            RequestStatus @default(PENDING)
  notes             String?       @db.Text // Internal notes for admins
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
}