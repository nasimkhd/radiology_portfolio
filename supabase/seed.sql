-- Radio From Scratch — seed data.
-- Safe to run after 0001_init.sql. Uses ON CONFLICT so it can be re-run.
--
-- IMPORTANT: The youtube_url / youtube_video_id values below are PLACEHOLDERS.
-- Replace them with your real YouTube links in the admin dashboard (or here)
-- before launch. Thumbnails fall back to a local placeholder if the ID is
-- not a real video.

-- =====================================================================
-- Categories
-- =====================================================================
insert into public.categories (name, slug, description, display_order)
values
  ('Basics', 'basics', 'Foundational radiology concepts and systematic approaches.', 1),
  ('Cardiothoracic', 'cardiothoracic', 'Chest radiographs, thoracic CT, and cardiac imaging.', 2),
  ('Neuroradiology', 'neuroradiology', 'Brain and spine imaging across CT and MRI.', 3),
  ('Abdominal Radiology', 'abdominal-radiology', 'Abdominopelvic CT, ultrasound, and MRI.', 4),
  ('Breast Imaging', 'breast-imaging', 'Mammography, breast ultrasound, and breast MRI.', 5),
  ('Musculoskeletal', 'musculoskeletal', 'Bone, joint, and soft-tissue imaging.', 6),
  ('Interventional Radiology', 'interventional-radiology', 'Image-guided procedures and vascular interventions.', 7),
  ('Pediatric Radiology', 'pediatric-radiology', 'Pediatric-specific imaging findings and techniques.', 8)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  display_order = excluded.display_order;
-- =====================================================================
-- Allowed email domains (examples only — replace/remove before launch)
-- =====================================================================
insert into public.allowed_email_domains (domain, organization_name, auto_approve, trust_source)
values
  ('examplehospital.org', 'Example Hospital', true, 'manual_seed'),
  ('example.edu', 'Example University School of Medicine', true, 'manual_seed')
on conflict (domain) do nothing;

-- =====================================================================
-- Videos
-- =====================================================================
-- Public preview videos (2-3), shown to everyone.
insert into public.videos
  (category_id, title, slug, description, youtube_url, youtube_video_id, access_level, status, display_order, published_at)
values
  (
    (select id from public.categories where slug = 'neuroradiology'),
    'CT Head: Acute Hemorrhage',
    'ct-head-acute-hemorrhage',
    'Key CT findings for common intracranial hemorrhages and a systematic review approach.',
    'https://www.youtube.com/watch?v=REPLACE_ME_1',
    'REPLACE_ME_1',
    'public', 'published', 1, now()
  ),
  (
    (select id from public.categories where slug = 'cardiothoracic'),
    'CXR: Systematic Interpretation',
    'cxr-systematic-interpretation',
    'A step-by-step approach to reading the chest radiograph consistently.',
    'https://www.youtube.com/watch?v=REPLACE_ME_2',
    'REPLACE_ME_2',
    'public', 'published', 2, now()
  ),
  (
    (select id from public.categories where slug = 'abdominal-radiology'),
    'CT Abdomen: Acute Appendicitis',
    'ct-abdomen-acute-appendicitis',
    'Imaging features and pitfalls in acute appendicitis on CT.',
    'https://www.youtube.com/watch?v=REPLACE_ME_3',
    'REPLACE_ME_3',
    'public', 'published', 3, now()
  ),
  -- Member-only videos.
  (
    (select id from public.categories where slug = 'musculoskeletal'),
    'MRI Spine: Red Flags',
    'mri-spine-red-flags',
    'Key red-flag findings in the spine that require urgent recognition and management.',
    'https://www.youtube.com/watch?v=REPLACE_ME_4',
    'REPLACE_ME_4',
    'members', 'published', 4, now()
  ),
  (
    (select id from public.categories where slug = 'cardiothoracic'),
    'CT Chest: Pulmonary Embolism',
    'ct-chest-pulmonary-embolism',
    'CT pulmonary angiography findings of pulmonary embolism and pitfalls to avoid.',
    'https://www.youtube.com/watch?v=REPLACE_ME_5',
    'REPLACE_ME_5',
    'members', 'published', 5, now()
  ),
  (
    (select id from public.categories where slug = 'neuroradiology'),
    'MRI Brain: Demyelinating Disease',
    'mri-brain-demyelinating-disease',
    'Imaging features and differential diagnosis of common demyelinating disorders.',
    'https://www.youtube.com/watch?v=REPLACE_ME_6',
    'REPLACE_ME_6',
    'members', 'published', 6, now()
  ),
  (
    (select id from public.categories where slug = 'musculoskeletal'),
    'Wrist Trauma: Fracture Patterns',
    'wrist-trauma-fracture-patterns',
    'Common wrist fracture patterns and a systematic approach to evaluation on radiographs.',
    'https://www.youtube.com/watch?v=REPLACE_ME_7',
    'REPLACE_ME_7',
    'members', 'published', 7, now()
  ),
  (
    (select id from public.categories where slug = 'abdominal-radiology'),
    'FAST Ultrasound in Trauma',
    'fast-ultrasound-in-trauma',
    'Focused assessment with sonography in trauma: technique, views, and interpretation.',
    'https://www.youtube.com/watch?v=REPLACE_ME_8',
    'REPLACE_ME_8',
    'members', 'published', 8, now()
  ),
  (
    (select id from public.categories where slug = 'cardiothoracic'),
    'Board Review: High-Yield Chest Cases',
    'board-review-high-yield-chest',
    'Rapid-fire high-yield chest cases to prepare for radiology board examinations.',
    'https://www.youtube.com/watch?v=REPLACE_ME_9',
    'REPLACE_ME_9',
    'members', 'published', 9, now()
  )
on conflict (slug) do nothing;
