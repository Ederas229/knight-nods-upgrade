// Initialize module
Hooks.once('init', async () => {
  console.log('knight-nods-upgrade | Initializing knight-nods-upgrade');

  game.settings.register('knight-nods-upgrade', 'soin', {
    name: 'Formule nods Soin :',
    scope: 'world',
    config: true,
    requiresReload: false,
    type: String,
    default: '3d6',
  });

  game.settings.register('knight-nods-upgrade', 'energie', {
    name: 'Formule nods Energie :',
    scope: 'world',
    config: true,
    requiresReload: false,
    type: String,
    default: '3d6',
  });

  game.settings.register('knight-nods-upgrade', 'armure', {
    name: 'Formule nods Armure :',
    scope: 'world',
    config: true,
    requiresReload: false,
    type: String,
    default: '3d6',
  });
});

Hooks.on('renderActorSheet', async (sheet, html) => {
  html
    .find('div.nods img.dice')
    .off('click')
    .click(async (ev) => {
      const data = sheet.actor;
      // eslint-disable-next-line no-undef
      const target = $(ev.currentTarget);
      const nbre = +target.data('number');
      const nods = target.data('nods');

      if (nbre > 0) {
        const recuperation = data.system.combat.nods[nods].recuperationBonus;

        const rNods = new game.knight.RollKnight(
          `${game.settings.get('knight-nods-upgrade', nods)}+${recuperation}`,
          data.system,
        );
        rNods._flavor = game.i18n.localize(`KNIGHT.JETS.Nods${nods}`);
        rNods._success = false;
        await rNods.toMessage({
          speaker: {
            actor: sheet.actor?.id || null,
            token: sheet.actor?.token?.id || null,
            alias: sheet.actor?.name || null,
          },
        });

        let base = 0;
        let max = 0;
        let type = '';

        switch (nods) {
          case 'soin':
            type = 'sante';
            base = data.system.sante.value;
            max = data.system.sante.max;

            break;

          case 'energie':
            type = 'energie';
            base = data.system.energie.value;
            max = data.system.energie.max;
            break;

          case 'armure':
            type = 'armure';
            base = data.system.armure.value;
            max = data.system.armure.max;
            break;
        }

        const total = rNods.total;
        const final = base + total > max ? max : base + total;

        const update = {
          system: {
            combat: {
              nods: {
                [nods]: {
                  value: nbre - 1,
                },
              },
            },
            [type]: {
              value: final,
            },
          },
        };

        if (type === 'armure') {
          sheet._updatePA(final);
        }

        sheet.actor.update(update);
      }
    });

  html
    .find('div.nods img.diceTarget')
    .off('click')
    .click(async (ev) => {
      const data = sheet.actor;
      // eslint-disable-next-line no-undef
      const target = $(ev.currentTarget);
      const nbre = +target.data('number');
      const nods = target.data('nods');

      if (nbre > 0) {
        const rNods = new game.knight.RollKnight(
          `${game.settings.get('knight-nods-upgrade', nods)}+0`,
          sheet.actor.system,
        );
        rNods._flavor = game.i18n.localize(`KNIGHT.JETS.Nods${nods}`);
        rNods._success = false;
        await rNods.toMessage({
          speaker: {
            actor: data?.id || null,
            token: data?.token?.id || null,
            alias: data?.name || null,
          },
        });

        const update = {
          system: {
            combat: {
              nods: {
                [nods]: {
                  value: nbre - 1,
                },
              },
            },
          },
        };

        sheet.actor.update(update);
      }
    });
});
