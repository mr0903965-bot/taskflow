export const PRI_COLORS = ['#EF4444', '#F97316', '#EAB308', '#64748B']
export const TAG_COLORS = ['#60A5FA', '#A78BFA', '#34D399', '#FB923C', '#F472B6']

export const TODAY = (() => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
})()

export const SAMPLE_TASKS = [
  {
    id: 1,
    text: 'Entregar informe Q1 al cliente',
    priority: 'Urgente',
    tags: ['Trabajo'],
    due: TODAY.toISOString().split('T')[0],
    done: false,
    subtasks: [],
  },
  {
    id: 2,
    text: 'Pagar renta del mes',
    priority: 'Alta',
    tags: ['Finanzas'],
    due: (() => {
      const d = new Date(TODAY)
      d.setDate(d.getDate() + 1)
      return d.toISOString().split('T')[0]
    })(),
    done: false,
    subtasks: [
      { id: 101, text: 'Transferencia bancaria', done: false },
      { id: 102, text: 'Guardar comprobante', done: false },
    ],
  },
  {
    id: 3,
    text: 'Revisión médica anual',
    priority: 'Media',
    tags: ['Salud'],
    due: (() => {
      const d = new Date(TODAY)
      d.setDate(d.getDate() + 5)
      return d.toISOString().split('T')[0]
    })(),
    done: false,
    subtasks: [],
  },
  {
    id: 4,
    text: 'Leer capítulo 7 del libro',
    priority: 'Baja',
    tags: ['Estudio'],
    due: (() => {
      const d = new Date(TODAY)
      d.setDate(d.getDate() + 10)
      return d.toISOString().split('T')[0]
    })(),
    done: true,
    subtasks: [],
  },
]
