const isToday = (date) => {
    const today = new Date()
    return date.getDate() == today.getDate() &&
        date.getMonth() == today.getMonth() &&
        date.getFullYear() == today.getFullYear()
}

const getTodayDate = () => {
    let date = new Date();
    date.setHours(0,0,0,0);
    return date;  
}

const getTodayString = () => {
    const date = new Date();
    const day = ('0'+date.getDate()).slice(-2);
    const month = ('0'+(date.getMonth()+1)).slice(-2);
    return `${day}/${month}/${date.getFullYear()}`;
}

const addHours = (date, hours) => {
        let newDate = date
        newDate.setHours(date.getHours()+hours);
        console.log(newDate);
}

module.exports = {
    isToday,
    getTodayDate,
    getTodayString,
    addHours
}