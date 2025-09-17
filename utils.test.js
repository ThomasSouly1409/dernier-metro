const { nextTimeFromNow } = require("./utils");

describe("nextTimeFromNow", () => {
  const RealDate = Date;

  beforeAll(() => {
    // figer la date à 2025-09-17 15:00
    global.Date = class extends RealDate {
      constructor(...args) {
        if (args.length) {
          return new RealDate(...args);
        }
        return new RealDate("2025-09-17T15:00:00Z");
      }
    };
  });

  afterAll(() => {
    global.Date = RealDate;
  });

  test("headway = 3 → retour +3 min", () => {
    const result = nextTimeFromNow(3);
    expect(result).toBe("15:03");
  });

  test("valeur par défaut → même résultat que 3 min", () => {
    const result = nextTimeFromNow();
    expect(result).toBe("15:03");
  });

  test("headway invalide (≤0) → retourne null", () => {
    expect(nextTimeFromNow(0)).toBeNull();
    expect(nextTimeFromNow(-5)).toBeNull();
    expect(nextTimeFromNow("abc")).toBeNull();
  });
});