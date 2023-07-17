export const questionTypes = {
  selectOption: "selectOption",
  likert: "likert",
  textarea: "textarea",
};

export const reviewQuestions = {
  meetings: {
    id: "meetings",
    label:
      "¿Qué tan frecuentemente tenían reuniones para revisar tu proyecto? (planeación, avances, dudas, etc.)",
    type: questionTypes.selectOption,
    options: [
      { value: "never", label: "Casi nunca" },
      {
        value: "requestedByAlumni",
        label: "Normalmente yo lo solicitaba",
      },
      {
        value: "requestedByTutor",
        label: "Normalmente mi tutor lo solicitaba",
      },
      { value: "FewTimesMonth", label: "Programada, un par al mes" },
      { value: "weekly", label: "Programada, semanalmente" },
    ],
  },
  researchEquipment: {
    id: "researchEquipment",
    label:
      "¿Provee herramientas, condiciones y equipo suficiente para desarrollar el trabajo de investigación?",
    type: questionTypes.likert,
    scaleSize: 5,
    maxMinOptions: {
      min: "Casi nunca",
      max: "Siempre",
    },
  },
  labEnvironment: {
    id: "labEnvironment",
    label: "El ambiente de trabajo en el laboratorio es:",
    type: questionTypes.likert,
    scaleSize: 5,
    maxMinOptions: {
      min: "Muy malo o incómodo",
      max: "Muy bueno",
    },
  },
  tutorUpdated: {
    id: "tutorUpdated",
    label: "¿Qué tan actualizado está en su área?",
    type: questionTypes.likert,
    scaleSize: 5,
    maxMinOptions: {
      min: "Muy poco",
      max: "Se mantiene al día",
    },
  },
  openToCollaborate: {
    id: "openToCollaborate",
    label:
      "¿Está abierto a colaborar con otros profesores o centros de investigación?",
    type: questionTypes.likert,
    scaleSize: 5,
    maxMinOptions: {
      min: "Muy poco",
      max: "Siempre abierto a colaborar",
    },
  },
  respectToAlumni: {
    id: "respectToAlumni",
    label: "¿Es respetuoso hacia el alumno?",
    type: questionTypes.likert,
    scaleSize: 5,
    maxMinOptions: {
      min: "Muy poco",
      max: "Siempre",
    },
  },
  attentionToAlumni: {
    id: "attentionToAlumni",
    label:
      "¿Qué tanta atención o guía sientes que tuviste de su parte? (planeación, dudas, desarrollo)",
    type: questionTypes.likert,
    scaleSize: 5,
    maxMinOptions: {
      min: "Casi nada",
      max: "Toda la necesaria",
    },
  },
  productivity: {
    id: "productivity",
    label: "¿Suele publicar o tener proyectos de investigación?",
    type: questionTypes.likert,
    scaleSize: 5,
    maxMinOptions: {
      min: "Casi nunca",
      max: "Sí, siempre",
    },
  },
  generalComment: {
    id: "generalComment",
    type: questionTypes.textarea,
    label:
      "¿Algo que le quieras contar a un futuro estudiante de este tutor? (Cosas positivas o negativas)",
    maxLength: 500,
  },
  projectTimeline: {
    id: "projectTimeline",
    label:
      "El tiempo del proyecto y expectativas fueron adecuadas para tu programa de estudios",
    type: questionTypes.likert,
    scaleSize: 5,
    maxMinOptions: {
      min: "No, era muy ambicioso",
      max: "Sí, era adecuado",
    },
  },
};

export const questionsToDisplay = [
  reviewQuestions.meetings.id,
  reviewQuestions.researchEquipment.id,
  reviewQuestions.tutorUpdated.id,
  reviewQuestions.openToCollaborate.id,
  reviewQuestions.productivity.id,
  reviewQuestions.respectToAlumni.id,
  reviewQuestions.attentionToAlumni.id,
  reviewQuestions.labEnvironment.id,
  reviewQuestions.projectTimeline.id,
  reviewQuestions.generalComment.id,
];
