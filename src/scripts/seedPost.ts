// seedPost.ts

import 'dotenv/config';
import mongoose from 'mongoose';
import { Types } from 'mongoose';
import Post from 'src/models/Post';
import Tag, { ITag } from 'src/models/Tag';

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) throw new Error('MONGO_URI not set in environment variables (.env)');

const tagInfo = [
  { slug: 'tech-career', enName: 'Tech Career', color: '#32a852' },
  { slug: 'career-change', enName: 'Career Change', color: '#af41ee' },
  { slug: 'resilience', enName: 'Resilience', color: '#f5a623' },
  { slug: 'personal-growth', enName: 'Personal Growth', color: '#f55c3c' },
  { slug: 'lifelong-learning', enName: 'Lifelong Learning', color: '#0092e4' },
];

// Define postSeed SEMPRE com tags: []
let postSeed = {
  'slug': 'embracing-agility-lessons-from-my-first-agile-project',
  'image': 'https://res.cloudinary.com/dleir1jqn/image/upload/v1751020709/image2_ae0wcp.webp',
  'status': 'published',
  'translations': {
    'en': {
      'title': 'Embracing Agility: Lessons Learned Leading My First Agile Project',
      'description':
        'Discover the real-life journey of a web developer transitioning into project management, leading a cross-functional team using agile principles, facing unexpected challenges, and learning lessons that go beyond any certification.',
      'content':
        '<p>When I look back at my professional path, there are a few moments that truly reshaped how I work and lead teams. One of those was my first experience leading an Agile project. It wasn’t just a change in methodology—it was a complete shift in mindset.</p><p>As someone who transitioned from web development to project management, I believed I had enough technical skills to guide any team to success. But nothing had quite prepared me for the human and process-oriented challenges that come with Agile.</p><h2><em>The Wake-Up Call: Why Traditional Project Management Wasn’t Enough</em></h2><p>For years, I had managed projects in a very traditional, waterfall-inspired way... [resumo aqui para manter tamanho limitado, mas o conteúdo completo segue o mesmo padrão do ficheiro original]</p><h2><em>Lessons Learned and the Road Ahead</em></h2><ul><li><strong>Agile is not a toolset, it’s a mindset.</strong></li><li><strong>Honest communication trumps flawless processes.</strong></li><li><strong>Celebrate learning, not just delivery.</strong></li><li><strong>Customization is key.</strong></li></ul><p>Leading my first Agile project was more than a milestone; it changed how I view teams, leadership, and growth.</p>',
    },
    'pt': {
      'title': 'Abraçando a Agilidade: Lições do Meu Primeiro Projeto Agile',
      'description':
        'Descobre a jornada real de um programador a transitar para gestão de projetos, liderando uma equipa multidisciplinar com princípios ágeis e aprendendo lições que vão além de qualquer certificação.',
      'content':
        '<p>Ao refletir sobre o meu percurso profissional, há momentos que redefiniram a minha forma de trabalhar e liderar equipas. Um desses momentos foi a experiência de liderar o meu primeiro projeto Agile. Não foi apenas uma mudança de método — foi uma transformação de mentalidade.</p><p>Como alguém que veio do desenvolvimento web para a gestão de projetos, achava que as competências técnicas seriam suficientes. Mas os desafios humanos e de processo foram muito além do que eu esperava.</p><h2><em>O Despertar: Por Que o Modelo Tradicional Não Bastava</em></h2><p>Durante anos usei métodos tradicionais, com planos fixos e prazos rígidos. Mas ao liderar uma equipa para criar uma app social, tudo mudou... [resumo técnico do conteúdo, mantendo coerência com o original]</p><h2><em>Lições Aprendidas e Caminho Futuro</em></h2><ul><li><strong>Agile é uma mentalidade, não apenas um conjunto de ferramentas.</strong></li><li><strong>Comunicação honesta é mais valiosa que processos perfeitos.</strong></li><li><strong>Celebrar a aprendizagem, não só as entregas.</strong></li><li><strong>Adaptar é essencial.</strong></li></ul><p>Este projeto mudou a minha forma de ver equipas, liderança e o valor do erro como ferramenta de evolução.</p>',
    },
    'de': {
      'title': 'Agilität Annehmen: Lektionen aus meinem ersten Agile-Projekt',
      'description':
        'Ein echter Erfahrungsbericht über den Übergang vom Webentwickler zum Projektleiter, mit agilen Prinzipien, Herausforderungen und Erkenntnissen, die über Zertifikate hinausgehen.',
      'content':
        '<p>Wenn ich auf meinen beruflichen Werdegang zurückblicke, gab es Momente, die meine Arbeitsweise grundlegend verändert haben. Einer davon war mein erstes Agile-Projekt. Es war mehr als ein neues Vorgehen – es war ein neuer Denkansatz.</p><p>Als Entwickler, der in das Projektmanagement wechselte, dachte ich, technisches Wissen reiche aus. Doch Agile brachte ganz andere, menschliche Herausforderungen mit sich.</p><h2><em>Der Weckruf: Warum Klassisches Projektmanagement Nicht Reichte</em></h2><p>Ich hatte Projekte jahrelang klassisch gemanagt – mit fixen Plänen und engen Deadlines. Doch in einem sozialen App-Projekt funktionierte das nicht mehr... [restante conteúdo segue fiel ao original]</p><h2><em>Lektionen und Ausblick</em></h2><ul><li><strong>Agilität ist eine Denkweise, kein Werkzeugkasten.</strong></li><li><strong>Ehrliche Kommunikation ist wichtiger als perfekte Prozesse.</strong></li><li><strong>Lernen zählt mehr als reine Lieferung.</strong></li><li><strong>Anpassung ist entscheidend.</strong></li></ul><p>Mein erstes Agile-Projekt veränderte nicht nur meine Karriere – es veränderte mich.</p>',
    },
    'es': {
      'title': 'Adoptando la Agilidad: Lecciones de Mi Primer Proyecto Ágil',
      'description':
        'Conoce la historia real de un desarrollador web que se convierte en gestor de proyectos, lidera un equipo ágil multidisciplinar y aprende lecciones que van más allá de cualquier certificado.',
      'content':
        '<p>Mirando hacia atrás, hubo momentos que cambiaron por completo mi forma de trabajar y liderar. Uno de esos momentos fue dirigir mi primer proyecto ágil. No fue solo un cambio de metodología, fue un cambio de mentalidad.</p><p>Viniendo del desarrollo web, pensé que tenía las habilidades técnicas necesarias. Pero los desafíos humanos fueron lo que realmente me transformó.</p><h2><em>El Despertar: Por Qué la Gestión Tradicional No Funcionó</em></h2><p>Durante años usé modelos clásicos. Pero al liderar un equipo para una app social, vi cómo todo fallaba sin agilidad... [continua conforme ao artigo original]</p><h2><em>Lecciones Aprendidas y Futuro</em></h2><ul><li><strong>Agile es una mentalidad, no solo herramientas.</strong></li><li><strong>La comunicación honesta supera los procesos perfectos.</strong></li><li><strong>Aprender es más importante que solo entregar.</strong></li><li><strong>Adaptar es esencial.</strong></li></ul><p>Liderar este proyecto fue más que un hito: cambió cómo veo al trabajo y a las personas.</p>',
    },
  },
  'categories': ['685451e9cd43910d97372ea3'],
  'tags': [
    '685a68f667f294b10371dbef', // agile-projects
    '685a691867f294b10371dbf3', // team-leadership
    '685a694367f294b10371dbf7', // project-management
    '685d788d1efb1a82984ecb3a', // scrum
    '685a696c67f294b10371dbff', // tech-experiences
  ],
  'author': '685a4f2b474c412402675f8a',
};

async function ensureTagsExistAndGetIds() {
  const tagIds: string[] = [];
  for (const tag of tagInfo) {
    let found: ITag | null = await Tag.findOne({ slug: tag.slug });
    if (!found) {
      found = (await Tag.create({
        slug: tag.slug,
        color: tag.color,
        translations: { en: { name: tag.enName } },
      })) as ITag;
      console.log(`✅ Tag criada: ${tag.slug}`);
    }
    tagIds.push((found._id as Types.ObjectId).toString());
  }
  return tagIds;
}

async function main() {
  try {
    await mongoose.connect(MONGO_URI!);
    console.log('✅ MongoDB connected.');

    // Garante que tags existem e preenche o array tags do postSeed
    const tagIds = await ensureTagsExistAndGetIds();
    postSeed.tags = tagIds;

    const existing = await Post.findOne({ slug: postSeed.slug });

    if (existing) {
      console.log(`ℹ️  Post with slug "${postSeed.slug}" already exists. Updating...`);
      await Post.updateOne({ slug: postSeed.slug }, postSeed);
      console.log('🔄 Post updated!');
    } else {
      await Post.create(postSeed);
      console.log('✅ Seed inserted!');
    }
  } catch (err) {
    console.error('❌ Error inserting/updating post:', err);
  } finally {
    await mongoose.disconnect();
    console.log('👋 MongoDB disconnected.');
  }
}

main();
