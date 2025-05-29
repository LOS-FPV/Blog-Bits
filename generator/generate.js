import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import { OpenAI } from 'openai';
import axios from 'axios';
import { execSync } from 'child_process';
import { format } from 'date-fns';

// Setup paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const contentDir = path.join(__dirname, '../content/posts');
const imageDir = path.join(__dirname, '../public/images');

// Ensure folders exist
fs.mkdirSync(contentDir, { recursive: true });
fs.mkdirSync(imageDir, { recursive: true });

// Setup OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Generate blog topic
const topic = 'Best E-Scooter Accessories for 2025';
const slug = topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const formattedDate = format(new Date(), 'yyyy-MM-dd');

// Generate content
const completion = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [
    { role: 'system', content: 'Write a markdown blog post with a heading and paragraphs about the topic.' },
    { role: 'user', content: topic },
  ],
});
const article = completion.choices[0].message.content;

// Generate image
const imageResponse = await openai.images.generate({
  model: 'dall-e-3',
  prompt: `A realistic photo of modern e-scooter accessories in 2025: helmets, wheels, batteries, controllers`,
  n: 1,
  size: '1024x1024',
  response_format: 'url',
});
const imageUrl = imageResponse.data[0].url;

// Save image
const imagePath = path.join(imageDir, `${slug}.jpg`);
const imageDownload = await axios.get(imageUrl, { responseType: 'arraybuffer' });
fs.writeFileSync(imagePath, imageDownload.data);

// Save content
const filePath = path.join(contentDir, `${slug}.mdx`);
const frontmatter = matter.stringify(article, {
  title: topic,
  date: formattedDate,
  image: `/images/${slug}.jpg`,
});
fs.writeFileSync(filePath, frontmatter);

// Git commit & push
execSync('git add .', { stdio: 'inherit' });
execSync(`git commit -m "Add post: ${topic}"`, { stdio: 'inherit' });
execSync('git push origin main', { stdio: 'inherit' });

console.log(`✅ Post generated and pushed: ${slug}`);
