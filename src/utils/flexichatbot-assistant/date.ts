// const getSpanishDay = function(day: string) {
//     switch(day) {
//         case 'Monday': return 'Lunes'
//         case 'Tuesday': return 'Martes'
//         case 'Wednesday': return 'Miercoles'
//         case 'Thursday': return 'Jueves'
//         case 'Friday': return 'Viernes'
//         case 'Saturday': return 'Sábado'
//         case 'Sunday': return 'Domingo'
//     }

//     return ''
// }

export const getFormattedDate = function (date: Date) {
    let dd = date.getDate().toString()
    let mm = (date.getMonth() + 1).toString()

    if (parseInt(dd) < 10) {
        dd = '0' + dd
    }
    if (parseInt(mm) < 10) {
        mm = '0' + mm
    }

    return `${dd}/${mm}/${date.getFullYear()}`
}

export const getFormattedHour = function (date: Date) {
    let hours = date.getHours().toString()
    let minutes = date.getMinutes().toString()
    let seconds = date.getSeconds().toString()

    if (parseInt(hours) < 10) {
        hours = '0' + hours
    }
    if (parseInt(minutes) < 10) {
        minutes = '0' + minutes
    }
    if (parseInt(seconds) < 10) {
        seconds = '0' + seconds
    }

    return `${hours}:${minutes}`
}