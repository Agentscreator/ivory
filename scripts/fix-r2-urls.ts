// Script to fix expired R2 signed URLs in the database
// Converts signed URLs to public URLs

import { db } from '../db';
import { looks } from '../db/schema';
import { sql } from 'drizzle-orm';

async function fixR2Urls() {
  console.log('🔍 Finding records with signed R2 URLs...');

  // Get all looks with R2 URLs
  const allLooks = await db.select().from(looks);
  
  let updatedCount = 0;
  
  for (const look of allLooks) {
    let needsUpdate = false;
    let newImageUrl = look.imageUrl;
    let newOriginalImageUrl = look.originalImageUrl;
    
    // Fix imageUrl if it's a signed URL
    if (look.imageUrl?.includes('X-Amz-Signature')) {
      // Extract the key from the signed URL
      const match = look.imageUrl.match(/\/mirro\/([^?]+)/);
      if (match) {
        const key = match[1];
        newImageUrl = `https://pub-f50a78c96ae94eb08dea6fb65f69d0e1.r2.dev/${key}`;
        needsUpdate = true;
        console.log(`  ✓ Fixed imageUrl for look #${look.id}: ${key}`);
      }
    }
    
    // Fix originalImageUrl if it's a signed URL
    if (look.originalImageUrl?.includes('X-Amz-Signature')) {
      const match = look.originalImageUrl.match(/\/mirro\/([^?]+)/);
      if (match) {
        const key = match[1];
        newOriginalImageUrl = `https://pub-f50a78c96ae94eb08dea6fb65f69d0e1.r2.dev/${key}`;
        needsUpdate = true;
        console.log(`  ✓ Fixed originalImageUrl for look #${look.id}: ${key}`);
      }
    }
    
    // Update the record if needed
    if (needsUpdate) {
      await db
        .update(looks)
        .set({
          imageUrl: newImageUrl,
          originalImageUrl: newOriginalImageUrl,
          updatedAt: new Date(),
        })
        .where(sql`${looks.id} = ${look.id}`);
      
      updatedCount++;
    }
  }
  
  console.log(`\n✅ Done! Updated ${updatedCount} records.`);
  process.exit(0);
}

fixR2Urls().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
