import {isLocale,type Locale} from "@/lib/i18n";

const copy:Record<Locale,{saving:string;noReviewProjects:string;noDisputeProjects:string}>={
 ar:{saving:"جارٍ الإرسال…",noReviewProjects:"لا توجد مشاريع مكتملة متاحة لتقييم جديد. يُتاح التقييم بعد اكتمال المشروع وانتهاء أي نزاع أو استئناف.",noDisputeProjects:"لا توجد مشاريع متاحة لفتح نزاع جديد."},
 en:{saving:"Submitting…",noReviewProjects:"No completed projects are available for a new review. Reviews become available after completion and any dispute or appeal is finished.",noDisputeProjects:"No projects are available for a new dispute."},
 tr:{saving:"Gönderiliyor…",noReviewProjects:"Yeni değerlendirme için tamamlanmış proje yok. Değerlendirmeler proje ve varsa uyuşmazlık veya itiraz tamamlandıktan sonra açılır.",noDisputeProjects:"Yeni uyuşmazlık açılabilecek proje yok."},
 es:{saving:"Enviando…",noReviewProjects:"No hay proyectos completados disponibles para una nueva reseña. Las reseñas se habilitan tras completar el proyecto y resolver cualquier disputa o apelación.",noDisputeProjects:"No hay proyectos disponibles para abrir una nueva disputa."},
 fr:{saving:"Envoi…",noReviewProjects:"Aucun projet terminé n’est disponible pour un nouvel avis. Les avis sont disponibles après la fin du projet et la résolution des litiges ou recours.",noDisputeProjects:"Aucun projet n’est disponible pour un nouveau litige."},
 de:{saving:"Wird gesendet…",noReviewProjects:"Keine abgeschlossenen Projekte für eine neue Bewertung verfügbar. Bewertungen sind nach Projektabschluss und Abschluss aller Streitfälle oder Einsprüche möglich.",noDisputeProjects:"Keine Projekte für einen neuen Streitfall verfügbar."}
};
export function actionStateCopy(locale:string){return copy[isLocale(locale)?locale:"en"]}
