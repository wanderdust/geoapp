let datePickerOptions = {
  onOpen: function () {
    $('.datepicker').blur();
  },

  onClose: function () {
    $('.datepicker').blur();
  },

  onSelect: function () {
    $('.datepicker').blur();
  },

  twelveHour: true ,

  i18n: {
    done: 'Ok',
    today: 'Hoy',
    clear: 'Vaciar',
    cancel: 'Cancelar',
    months: [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre'
    ],
    monthsShort: [
      'Ene',
      'Feb',
      'Mar',
      'Abr',
      'May',
      'Jun',
      'Jul',
      'Ago',
      'Sep',
      'Oct',
      'Nov',
      'Dic'
    ],
    weekdays: [
      'Domingo',
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
      'Sábado'
    ],
    weekdaysShort: [
      'Dom',
      'Lun',
      'Mar',
      'Mie',
      'Jue',
      'Vie',
      'Sab'
    ],
    weekdaysAbbrev: ['D', 'L', 'M', 'X', 'J', 'V', 'S']
  }
}
