export const blockedWords = [
    "kurva", "kurvá", "kurwa", "qurva", "fasz", "fász", "fsz", "geci", "gecí", "gci", 
    "szar", "szár", "picsa", "picsá", "buzi", "búzi", "basz", "bász", "bazmeg", "bazzeg", 
    "anyad", "anyád", "csicska", "csicskó", "cigany", "cigány", "kocsog", "köcsög", 
    "faszfej", "segg", "nyelo", "nyelő", "szop", "szopó", "szopo", "retard", "retardált",
    "fuck", "shit", "bitch", "cunt", "nigger", "nigga", "faggot", "hitler", "nazi", 
    "náci", "porn", "porno", "pornó", "piná", "pina", "pöcs", "pocs", "csöcs", "csocs",
    "faszopó", "faszopo", "geciz", "gecíz", "baszás", "baszas", "kurvaf", "k.urva",
    "anyj", "anyukád", "ribanc", "ringyó", "ringyo", "gecinyelő", "gecinyelo",
    "cig", "cigo", "cigó", "putri", "csöves", "csoves", "dögölj", "dogolj",
    "verem", "megbasz", "kibasz", "szétbasz", "szetbasz", "rákbasi", "rakbasi"
];

export function isNameBlocked(name) {
    const sanitizedName = name.toLowerCase().replace(/\s+/g, '');
    return blockedWords.some(word => sanitizedName.includes(word));
}