let formatLocationGetStream = require('./formatLocationGetStream');

test('location without space', () => {
    expect(formatLocationGetStream("Semarang"))
        .toBe("semarang");
});

test('location without space', () => {
    expect(formatLocationGetStream("Semarang  "))
        .not.toBe("semarang");
});

test('location with space', () => {
    expect(formatLocationGetStream("Jl. Jendral Sudirman No.187, Ruko Siliwangi Plaza Blok A4"))
        .toBe("jl.-jendral-sudirman-no.187,-ruko-siliwangi-plaza-blok-a4");
});



