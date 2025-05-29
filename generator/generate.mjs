// generator/generate.js

import fs from 'fs';
import path from 'path';
import axios from 'axios';
import dotenv from 'dotenv';
import { format } from 'date-fns';

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const BLOG_DIR = './content/posts';

const KEYWORDS = [
  'best electric scooters 2025',
  'lightweight e-moto for city commute',
  'e-scooter maintenance tips',
  'top e-motos under $3000',
  'eco benefits of electric mobility'
];

async function generateArticle(keyword) {
  const prompt = `Write a detailed blog post (500+ words) on "${keyword}". Include comparisons, pros/cons, and end with a strong call to action to check out top e-scooters and e-motos. Include Amazon affiliate links in Markdown format.`;

  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    },
    {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data.choices[0].message.content;
}

function saveArticle(content, keyword) {
  const slug = keyword.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const date = format(new Date(), 'yyyy-MM-dd');
  const filename = `${date}-${slug}.mdx`;
  const filepath = path.join(BLOG_DIR, filename);

  const frontMatter = `---\ntitle: "${keyword}"\ndate: "${date}"\ntags: [e-scooter, e-moto]\ndescription: Auto-generated blog on "${keyword}"\n---\n\n`;

  const footer = `\n\n---\n\n**Top Products:**\n\n- [Best Electric Scooter on Amazon](https://www.amazon.com/dp/B07Z5XHX6F?tag=yourtag-20)\n- [Affordable E-Moto on Amazon](https://www.amazon.com/dp/B08N5WRWNW?tag=yourtag-20)`;

  fs.writeFileSync(filepath, frontMatter + content + footer);
  console.log(`✅ Blog post saved to ${filepath}`);
}

async function main() {
  const keyword = KEYWORDS[Math.floor(Math.random() * KEYWORDS.length)];
  try {
    const content = await generateArticle(keyword);
    saveArticle(content, keyword);
  } catch (error) {
    console.error('❌ Error generating article:', error.response?.data || error.message);
  }
}

main();
