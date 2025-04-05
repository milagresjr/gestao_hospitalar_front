

export function calcIdade(dataNasc: string) {
    const anoNasc = dataNasc.substring(0,4)
    const anoAtual = new Date().getFullYear()
    const idade = Number(anoAtual) - Number(anoNasc)
    return idade
}

export function formatDateTime(dateTime: string | undefined): string {
    if (!dateTime) {
        return '';
    }
    const [date, time] = dateTime.split(' ');
    const [year, month, day] = date.split('-');
    const formattedDate = `${day}-${month}-${year}`;
    const formattedTime = time.substring(0, 5);
    return `${formattedDate} ${formattedTime}`;
}

export function formatDate(dateTime: string | undefined): string {
    if (!dateTime) {
        return '';
    }
    const [date, time] = dateTime.split(' ');
    const [year, month, day] = date.split('-');
    const formattedDate = `${day}-${month}-${year}`;
    const formattedTime = time.substring(0, 5);
    return `${formattedDate}`;
}

