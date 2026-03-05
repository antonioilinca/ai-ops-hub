import { COURSES } from "./formation-data";

/**
 * Retourne le contenu HTML d'une leçon.
 * Pour l'instant, génère du contenu structuré à partir des métadonnées.
 * À terme, ce fichier sera remplacé par du contenu éditorial réel
 * (ou un fetch depuis un CMS / Supabase).
 */
export function getLessonContent(lessonId: string): string {
  // Trouver la leçon et son cours parent
  for (const course of COURSES) {
    const lesson = course.lessons.find((l) => l.id === lessonId);
    if (!lesson) continue;

    const lessonIdx = course.lessons.findIndex((l) => l.id === lessonId);
    const lessonNumber = lessonIdx + 1;

    const TYPE_LABEL: Record<string, string> = {
      video: "Vidéo",
      lecture: "Lecture",
      exercise: "Exercice pratique",
    };

    const typeLabel = TYPE_LABEL[lesson.type] ?? lesson.type;

    if (lesson.type === "exercise") {
      return generateExerciseContent(lesson.title, course.title, lessonNumber, course.lessonsCount);
    }
    if (lesson.type === "video") {
      return generateVideoContent(lesson.title, course.title, lessonNumber, course.lessonsCount, lesson.duration);
    }
    return generateLectureContent(lesson.title, course.title, lessonNumber, course.lessonsCount);
  }

  return `<p>Contenu en cours de rédaction. Revenez bientôt !</p>`;
}

function generateLectureContent(
  title: string,
  courseTitle: string,
  lessonNum: number,
  total: number
): string {
  return `
<h2>${title}</h2>

<p>Bienvenue dans la leçon ${lessonNum} du cours <strong>${courseTitle}</strong>. Cette leçon de lecture vous donnera les fondamentaux nécessaires pour maîtriser ce sujet et l'appliquer concrètement dans votre travail quotidien.</p>

<h3>📋 Ce que vous allez apprendre</h3>
<ul>
  <li>Les concepts clés liés à <strong>${title.toLowerCase()}</strong></li>
  <li>Les bonnes pratiques utilisées par les entreprises performantes</li>
  <li>Les erreurs courantes à éviter absolument</li>
  <li>Des exemples concrets et applicables immédiatement</li>
</ul>

<h3>🎯 Points clés</h3>

<p>La compréhension de ce sujet est essentielle pour toute équipe qui souhaite tirer parti de l'IA de manière stratégique. Voici les points importants à retenir :</p>

<blockquote>
  <strong>💡 À retenir :</strong> La clé du succès n'est pas dans la technologie elle-même, mais dans la façon dont vous l'intégrez à vos processus existants. Commencez petit, mesurez les résultats, puis scalez.
</blockquote>

<h3>📊 En pratique</h3>

<p>Pour mettre en pratique ces concepts, nous vous recommandons de :</p>

<ol>
  <li><strong>Observer</strong> — Identifiez dans votre quotidien les tâches répétitives qui pourraient bénéficier de cette approche</li>
  <li><strong>Expérimenter</strong> — Testez sur un périmètre restreint avant de déployer à grande échelle</li>
  <li><strong>Mesurer</strong> — Définissez des KPIs clairs avant de commencer (temps gagné, qualité, coût)</li>
  <li><strong>Itérer</strong> — Ajustez votre approche en fonction des retours terrain</li>
</ol>

<h3>📌 Résumé</h3>

<p>Cette leçon vous a donné les bases pour comprendre et appliquer les principes de <strong>${title.toLowerCase()}</strong>. Dans la suite du cours, nous approfondirons ces concepts avec des exercices pratiques et des études de cas.</p>

${lessonNum < total ? `<p><em>→ Passez à la leçon suivante pour continuer votre progression.</em></p>` : `<p><em>🎉 C'est la dernière leçon de ce cours ! Félicitations pour votre progression.</em></p>`}
`.trim();
}

function generateExerciseContent(
  title: string,
  courseTitle: string,
  lessonNum: number,
  total: number
): string {
  return `
<h2>✏️ ${title}</h2>

<p>Passons à la pratique ! Cet exercice fait partie du cours <strong>${courseTitle}</strong> et va vous permettre d'appliquer concrètement ce que vous avez appris.</p>

<h3>🎯 Objectif de l'exercice</h3>
<p>À la fin de cet exercice, vous serez capable d'appliquer les concepts vus précédemment de manière autonome dans votre contexte professionnel.</p>

<h3>📋 Instructions</h3>

<ol>
  <li><strong>Préparez votre contexte</strong> — Choisissez un cas réel de votre entreprise ou utilisez l'exemple fourni ci-dessous</li>
  <li><strong>Appliquez la méthode</strong> — Suivez les étapes décrites dans les leçons précédentes</li>
  <li><strong>Documentez vos résultats</strong> — Notez ce qui a fonctionné et les difficultés rencontrées</li>
  <li><strong>Analysez</strong> — Comparez vos résultats avec les critères de succès</li>
</ol>

<h3>💼 Cas pratique</h3>

<blockquote>
  <strong>Scénario :</strong> Vous êtes responsable d'une équipe de 5 personnes. Votre direction vous demande d'identifier comment l'IA pourrait améliorer la productivité de votre département de 20% en 3 mois. Utilisez les frameworks vus dans ce cours pour structurer votre approche.
</blockquote>

<h3>✅ Critères de réussite</h3>
<ul>
  <li>Votre analyse couvre au moins 3 processus différents</li>
  <li>Chaque opportunité identifiée a un ROI estimé</li>
  <li>Vous avez un plan d'action avec des échéances réalistes</li>
  <li>Les risques principaux sont identifiés et mitigés</li>
</ul>

<h3>💡 Conseils</h3>
<p>Ne cherchez pas la perfection — l'objectif est de <strong>pratiquer la méthode</strong>. Vous pouvez toujours affiner votre travail après avoir terminé l'exercice. Le plus important est de passer à l'action.</p>

${lessonNum < total ? `<p><em>→ Une fois l'exercice terminé, marquez cette leçon comme complétée et passez à la suite.</em></p>` : `<p><em>🎉 Bravo ! Vous avez terminé le dernier exercice de ce cours. N'hésitez pas à relire les leçons clés.</em></p>`}
`.trim();
}

function generateVideoContent(
  title: string,
  courseTitle: string,
  lessonNum: number,
  total: number,
  duration: string
): string {
  return `
<h2>🎬 ${title}</h2>

<p>Cette vidéo de <strong>${duration}</strong> fait partie du cours <strong>${courseTitle}</strong>.</p>

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; padding: 60px 40px; text-align: center; margin: 24px 0;">
  <div style="font-size: 48px; margin-bottom: 16px;">▶️</div>
  <p style="color: white; font-size: 18px; font-weight: 600; margin: 0;">Vidéo à venir</p>
  <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin-top: 8px;">Le contenu vidéo est en cours de production.</p>
</div>

<h3>📋 Ce que couvre cette vidéo</h3>
<ul>
  <li>Introduction au concept de <strong>${title.toLowerCase()}</strong></li>
  <li>Démonstrations pas-à-pas avec des exemples réels</li>
  <li>Bonnes pratiques et pièges à éviter</li>
  <li>Récapitulatif et prochaines étapes</li>
</ul>

<h3>📝 Notes clés</h3>

<blockquote>
  <strong>💡 Astuce :</strong> Prenez des notes pendant la vidéo et identifiez au moins une action concrète que vous pouvez mettre en place dès demain dans votre workflow.
</blockquote>

<p>Pour tirer le maximum de cette leçon, nous vous recommandons de regarder la vidéo en entier, puis de revenir sur les points clés qui vous semblent les plus pertinents pour votre situation.</p>

${lessonNum < total ? `<p><em>→ Passez à la leçon suivante quand vous êtes prêt.</em></p>` : `<p><em>🎉 Dernière vidéo du cours ! Félicitations pour avoir tout suivi.</em></p>`}
`.trim();
}
