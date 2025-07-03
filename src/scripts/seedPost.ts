// seedPost.ts

import 'dotenv/config';
import mongoose from 'mongoose';
import { Types } from 'mongoose';
import Post from '../models/Post';
import Tag, { ITag } from '../models/Tag';

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
  'slug': 'typescript-catches-your-mistakes',
  'image': 'https://res.cloudinary.com/dleir1jqn/image/upload/v1751134853/image11_muvv6q.webp',
  'status': 'published',
  'isQuickPost': true,
  'translations': {
    'en': {
      'title': 'Stop Guessing: How TypeScript Catches Your Mistakes Before You Do',
      'description':
        'Discover how TypeScript helps you prevent bugs by adding static types to JavaScript, making your code safer and more predictable.',
      'content':
        "<p>Let’s face it — JavaScript is flexible, sometimes too flexible. That’s great until your code breaks because <code>undefined</code> isn’t a function. Enter TypeScript, your code’s early warning system.</p><br><br><p>TypeScript adds static typing to JavaScript. This means you define the shape of your data, and TypeScript tells you when something doesn’t match.</p><br><br><strong><em>🛡️ Quick Win Example</em></strong><pre><code class=\"language-js\">function greet(name: string) {\n  return `Hello, ${name.toUpperCase()}`;\n}\n\ngreet(42); // ❌ Error: Argument of type 'number' is not assignable to parameter of type 'string'</code></pre><br><br><p>Without TypeScript, this error might only show up at runtime. With it, you catch it instantly — before even hitting the browser.</p><br><br><strong><em>🔍 Why It Matters</em></strong><ul><li>Fewer runtime bugs</li><li>Smarter autocompletion in your IDE</li><li>Safer refactoring</li><li>Better team collaboration</li></ul><br><br><p>You don’t have to use all of TypeScript’s features to get the benefits. Even just typing your function parameters and return values already makes a huge difference.</p><br><br><p>Start small, and you’ll wonder how you ever coded without it.</p><br><br><p>💬 Have you already used TypeScript in your projects? What was the biggest bug you avoided with it? Tell us!</p>",
    },
    'pt': {
      'title': 'Pare de Adivinhar: Como o TypeScript Apanha os Seus Erros Antes de Si',
      'description':
        'Descubra como o TypeScript ajuda a evitar bugs adicionando tipos estáticos ao JavaScript, tornando o código mais seguro e previsível.',
      'content':
        "<p>Vamos ser sinceros — o JavaScript é flexível, às vezes até demais. Isso é ótimo até que o código falha porque <code>undefined</code> não é uma função. É aí que entra o TypeScript — o sistema de alerta precoce do seu código.</p><br><br><p>O TypeScript adiciona tipagem estática ao JavaScript. Isto significa que defines a estrutura dos teus dados, e o TypeScript avisa quando algo não bate certo.</p><br><br><strong><em>🛡️ Exemplo Rápido</em></strong><pre><code class=\"language-js\">function greet(name: string) {\n  return `Hello, ${name.toUpperCase()}`;\n}\n\ngreet(42); // ❌ Erro: Argumento do tipo 'number' não é atribuível ao parâmetro do tipo 'string'</code></pre><br><br><p>Sem TypeScript, este erro só apareceria em tempo de execução. Com ele, apanhas o erro imediatamente — antes mesmo de abrir o navegador.</p><br><br><strong><em>🔍 Por que Importa</em></strong><ul><li>Menos bugs em tempo de execução</li><li>Autocompletar mais inteligente no IDE</li><li>Refatoração mais segura</li><li>Melhor colaboração em equipa</li></ul><br><br><p>Não é necessário usar todos os recursos do TypeScript para ter benefícios. Tipar os parâmetros das funções e valores de retorno já faz muita diferença.</p><br><br><p>Começa pequeno e vais perguntar-te como programavas sem ele.</p><br><br><p>💬 Já usaste TypeScript nos teus projetos? Qual foi o maior bug que evitaste com ele? Conta-nos!</p>",
    },
    'de': {
      'title': 'Hör auf zu raten: Wie TypeScript deine Fehler erkennt, bevor du es tust',
      'description':
        'Erfahre, wie TypeScript dir hilft, Bugs zu vermeiden, indem es statische Typen zu JavaScript hinzufügt – für sichereren und vorhersehbaren Code.',
      'content':
        "<p>Seien wir ehrlich – JavaScript ist flexibel, manchmal zu flexibel. Das ist großartig, bis dein Code abstürzt, weil <code>undefined</code> keine Funktion ist. Hier kommt TypeScript ins Spiel – dein Frühwarnsystem für Codefehler.</p><br><br><p>TypeScript ergänzt JavaScript mit statischer Typisierung. Das bedeutet: Du definierst die Struktur deiner Daten, und TypeScript sagt dir, wenn etwas nicht passt.</p><br><br><strong><em>🛡️ Schnelles Beispiel</em></strong><pre><code class=\"language-js\">function greet(name: string) {\n  return `Hello, ${name.toUpperCase()}`;\n}\n\ngreet(42); // ❌ Fehler: Argument vom Typ 'number' ist nicht dem Parameter vom Typ 'string' zuweisbar</code></pre><br><br><p>Ohne TypeScript würdest du diesen Fehler erst zur Laufzeit bemerken. Mit TypeScript erkennst du ihn sofort – noch bevor du den Browser startest.</p><br><br><strong><em>🔍 Warum das wichtig ist</em></strong><ul><li>Weniger Laufzeitfehler</li><li>Intelligentere Autovervollständigung im Editor</li><li>Sichereres Refactoring</li><li>Bessere Teamarbeit</li></ul><br><br><p>Du musst nicht alle TypeScript-Funktionen nutzen, um Vorteile zu haben. Schon das Typisieren von Parametern und Rückgabewerten bringt große Verbesserungen.</p><br><br><p>Fang klein an – du wirst TypeScript nicht mehr missen wollen.</p><br><br><p>💬 Hast du TypeScript bereits in Projekten verwendet? Welchen großen Bug konntest du damit verhindern? Erzähl es uns!</p>",
    },
    'es': {
      'title': 'Deja de Adivinar: Cómo TypeScript Detecta tus Errores Antes que Tú',
      'description':
        'Descubre cómo TypeScript te ayuda a prevenir errores agregando tipos estáticos a JavaScript, haciendo tu código más seguro y predecible.',
      'content':
        "<p>Aceptémoslo — JavaScript es flexible, a veces demasiado. Eso está bien hasta que tu código falla porque <code>undefined</code> no es una función. Ahí entra TypeScript, el sistema de alerta temprana de tu código.</p><br><br><p>TypeScript agrega tipado estático a JavaScript. Esto significa que defines la forma de tus datos, y TypeScript te avisa cuando algo no coincide.</p><br><br><strong><em>🛡️ Ejemplo Rápido</em></strong><pre><code class=\"language-js\">function greet(name: string) {\n  return `Hello, ${name.toUpperCase()}`;\n}\n\ngreet(42); // ❌ Error: El argumento de tipo 'number' no es asignable al parámetro de tipo 'string'</code></pre><br><br><p>Sin TypeScript, este error solo aparecería en tiempo de ejecución. Con él, lo detectas al instante — antes de abrir el navegador.</p><br><br><strong><em>🔍 Por qué Importa</em></strong><ul><li>Menos errores en tiempo de ejecución</li><li>Autocompletado más inteligente en tu editor</li><li>Refactorización más segura</li><li>Mejor colaboración en equipo</li></ul><br><br><p>No necesitas usar todas las funciones de TypeScript para beneficiarte. Solo tipar parámetros y retornos ya hace una gran diferencia.</p><br><br><p>Empieza poco a poco, y te preguntarás cómo programabas sin él.</p><br><br><p>💬 ¿Ya has usado TypeScript en tus proyectos? ¿Cuál fue el mayor error que evitaste gracias a él? ¡Cuéntanoslo!</p>",
    },
  },
  'categories': ['685451e9cd43910d97372ea5'],
  'tags': [
    '685bcf4f354ad20a4f0642dc',
    '685a68f667f294b10371dbef',
    '685a694367f294b10371dbf7',
    '685a696c67f294b10371dbff',
    '685bcf97354ad20a4f0642e0',
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
