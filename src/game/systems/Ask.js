export const ask = (compList, compFunc) => (who, request, defaultAnswer, gm) => {
    let answer = defaultAnswer;
    const awho = Array.isArray(who) ? who : [who];

    compList.forEach(cname => {
        awho.forEach(e => {
            const comp = e[cname];
            if(comp) {
                answer = compFunc(comp)(e, request, answer, gm);
            }
        });
    });

    return answer;
}
