const gameDuration = 30.0;
const CanvasWidth = 800;
const CanvasHeight = 450;
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
let tickNumber = 1;
canvas.onmousedown = onmousedown;
canvas.onmousemove = onmousemove;
window.addEventListener('keydown', handleKeyPress, false);

function loadImg(name) {
    const img = new Image();
    img.src = "img/" + name + ".png";
    return img;
}
function square(x) {
    return x * x;
}
function getRandomInt(min, max) {
    return Math.floor(min + Math.random() * (max - min));
}

const tileSet1 = loadImg("0x72_DungeonTilesetII_v1.7x2");
const tileSet2 = loadImg("Shikashi");


class Sprite {
    constructor(tile, tx, ty, tWidth, tHeight, nbImage) {
        this.tile = tile;
        this.tx = tx;
        this.ty = ty;
        this.tWidth = tWidth;
        this.tHeight = tHeight;
        this.singleWidth = tWidth / nbImage;
        this.correctAngus = 0;
        this.forbidRotate = false;
    }
    paint(x, y, frame, reverse) {
        if (typeof (frame) === "undefined")
            frame = 0
        if (reverse) {
            ctx.save();
            ctx.translate(x + this.singleWidth, y);
            ctx.scale(-1, 1);

            ctx.drawImage(this.tile,
                this.tx + frame * this.singleWidth, this.ty,
                this.singleWidth - 1, this.tHeight,
                0, 0,
                (this.singleWidth - 1), this.tHeight
            )
            ctx.restore();
        } else {
            ctx.drawImage(this.tile,
                this.tx + frame * this.singleWidth, this.ty,
                this.singleWidth - 1, this.tHeight,
                x, y,
                (this.singleWidth - 1), this.tHeight
            )
        }
    }
    paintRotate(x, y, angus) {
        if (this.forbidRotate) {
            this.paint(x, y, 0, false);
            return;
        }
        ctx.save();
        ctx.translate(x + this.singleWidth / 2, y + this.tHeight / 2);
        ctx.rotate(angus + this.correctAngus);
        ctx.drawImage(this.tile,
            this.tx, this.ty, this.singleWidth - 1, this.tHeight,
            -this.singleWidth / 2, -this.tHeight / 2, (this.singleWidth - 1), this.tHeight);
        ctx.restore();
    }
    paintScale(x, y, width, height) {
        ctx.drawImage(this.tile,
            this.tx, this.ty,
            this.singleWidth - 1, this.tHeight,
            x, y, width, height);
    }
}
const fastHealIcon = new Sprite(tileSet2, 416, 352, 32, 32, 1);
const fastHeal2Icon = new Sprite(tileSet2, 480, 352, 32, 32, 1);
const slowHealIcon = new Sprite(tileSet2, 0, 288, 32, 32, 1);
const slowHeal2Icon = new Sprite(tileSet2, 448, 288, 32, 32, 1);
const hotHealIcon = new Sprite(tileSet2, 160, 96, 32, 32, 1);
const aoeHealIcon = new Sprite(tileSet2, 480, 96, 32, 32, 1);
const healerSprite = new Sprite(tileSet1, 256, 340, 288, 48, 9);
const witchSprite = new Sprite(tileSet1, 256, 274, 288, 48, 9);
const redKnightSprite = new Sprite(tileSet1, 256, 148, 256, 48, 8);
const elfSprite = new Sprite(tileSet1, 256, 84, 256, 44, 8);
const berserkerSprite1 = new Sprite(tileSet1, 256, 532, 256, 44, 8);
const berserkerSprite2 = new Sprite(tileSet1, 256, 596, 256, 44, 8);
const necroSprite = new Sprite(tileSet1, 736, 792, 256, 48, 8);
const arrowSprite = new Sprite(tileSet1, 644, 400, 20, 48, 1);
const frostSprite = new Sprite(tileSet2, 352, 672, 32, 32, 1);
const swordSprite = new Sprite(tileSet1, 640, 16, 28, 48, 1);
const knifeSprite = new Sprite(tileSet1, 580, 16, 24, 32, 1);
const hamerSprite = new Sprite(tileSet1, 640, 76, 28, 48, 1);
const axeSprite = new Sprite(tileSet1, 676, 320, 28, 34, 1);
const fireballSprite = new Sprite(tileSet2, 32, 0, 32, 32, 1);
const hasteBuffSprite = new Sprite(tileSet2, 256, 672, 32, 32, 1);
fireballSprite.correctAngus = - 3 * Math.PI / 4;
const loseLifeProjectileSprite = new Sprite(tileSet2, 480, 160, 32, 32, 1);
const deadSprite = new Sprite(tileSet2, 0, 0, 32, 32, 1);
const greenPotionSprite = new Sprite(tileSet1, 640, 672, 28, 28, 1);
greenPotionSprite.forbidRotate = true;
const brokenArmorSprite = new Sprite(tileSet2, 160, 128, 32, 32, 1);
const invulnerableSprite = new Sprite(tileSet2, 64, 192, 32, 32, 1);
const bombSprite = new Sprite(tileSet2, 384, 320, 32, 32, 1);
bombSprite.forbidRotate = true;
const boneSprite = new Sprite(tileSet2, 0, 704, 32, 32, 1);
boneSprite.forbidRotate = true;
const skeletonSprite = new Sprite(tileSet1, 736, 172, 64, 48, 2);
const armorSprite = new Sprite(tileSet2, 224, 224, 32, 32, 1);
const damageBonusSprite = new Sprite(tileSet2, 64, 160, 32, 32, 1);
const critBonusSprite = new Sprite(tileSet2, 64, 96, 32, 32, 1);
const lifeBonusSprite = new Sprite(tileSet2, 128, 288, 32, 32, 1);
const recruitSprite = new Sprite(tileSet2, 416, 384, 32, 32, 1);
const dodgeSprite = new Sprite(tileSet2, 160, 512, 32, 32, 1);
const manaBonusSprite = new Sprite(tileSet2, 160, 288, 32, 32, 1);
const manaRegenBonusSprite = new Sprite(tileSet2, 288, 288, 32, 32, 1);
const healPowerBonusSprite = new Sprite(tileSet2, 192, 288, 32, 32, 1);
const learnSpellSprite = new Sprite(tileSet2, 352, 416, 32, 32, 1);
const bigBombSprite = new Sprite(tileSet1, 608, 640, 64, 32, 2);
class Character {
    constructor(name, type, sprite) {
        this.name = name;
        this.type = type;
        this.sprite = sprite;
        this.x = 400;
        this.y = 200;
        this.isVilain = false;
        this.width = sprite.singleWidth;
        this.height = sprite.tHeight;
        this.maxLife = 1000;
        this.life = 800;
        this.isTank = false;
        this.target = null;
        this.reverse = false;
        this.spells = [];
        this.buffs = [];
        this.onUpdate = null;
        this.talents = {};
        this.level = 1;
        this.armor = 0;
        this.armorBroken = 0;
        this.crit = 0;
        this.haste = 0;
        this.dodge = 5;
        this.isInvulnerable = false;
        this.slow = 0;
        this.ultimatePower = 0;
        this.collectedBones = 0;
        this.convertDeadIntoSkeletonChance = 0;
        this.isBerserk = false;
        this.berserkArmor = 0;
        this.animationsToStartOnInit = [];
        this.damageDone = 0;
        this.damageTaken = 0;
        this.damageNotMitagedTaken = 0;
    }
    paint() {
        let spriteNumber = Math.floor(tickNumber / 8) % 2;
        if (this.life <= 0) {
            spriteNumber = 0;
        }
        this.sprite.paint(this.x, this.y, spriteNumber, this.reverse);
        if (this.life <= 0) {
            deadSprite.paint(this.x + 4, this.y + 10);
        }
    }
    update() {
        if (this.life <= 0)
            return;
        for (let spell of this.spells) {
            spell.update(this);
        }
        for (let i = this.buffs.length - 1; i >= 0; i--) {
            if (this.buffs[i].update()) {
                this.buffs.splice(i, 1);
            }
        }
        if (this.onUpdate) {
            this.onUpdate(this);
        }
    }
    getArmor() {
        const remainingArmor = Math.max(0, this.armor * (100 - this.armorBroken) / 100);
        return Math.floor(remainingArmor);
    }
    getBerserkArmor() {
        return this.isBerserk ? this.berserkArmor : 0;
    }
    onHit(projectileStat) {
        if (this.life <= 0) {
            return;
        }
        const isCrit = Math.random() * 100 < projectileStat.from.crit;
        const baseDamage = projectileStat.from.isBerserk ? projectileStat.dmg * 2 : projectileStat.dmg;
        const fullDamge = isCrit ? baseDamage * 2 : baseDamage;
        this.damageNotMitagedTaken += fullDamge + 1;
        if (this.isInvulnerable) {
            allAnimations.push(new LabelAnim("invulnerable", this, "invulnerable", 0));
            return;
        }
        if (Math.random() * 100 < this.dodge) {
            allAnimations.push(new LabelAnim("dodge", this, "dodge", 0));
            return;
        }
        const dmg = Math.floor(1 + fullDamge * 100 * 100 / ((100 + this.getArmor()) * (100 + this.getBerserkArmor())));
        this.life = Math.max(0, this.life - dmg);
        projectileStat.from.damageDone += dmg;
        this.damageTaken += dmg;
        allAnimations.push(new LabelAnim(`${dmg}`, this, isCrit ? "crit" : "hit", dmg));
        if (this.life <= 0) {
            this.buffs = [];
            return;
        }
        if (projectileStat.hitFunc != null) {
            projectileStat.hitFunc(this);
        }
    }
    onHeal(power, isCrit) {
        if (this.life <= 0) {
            return;
        }
        allAnimations.push(new LabelAnim(`${power}`, this, isCrit ? "critHeal" : "heal", power));
        this.life = Math.min(this.maxLife, this.life + power);
    }
    pushBuff(buff) {
        for (let i = this.buffs.length - 1; i >= 0; i--) {
            if (this.buffs[i].name == buff.name) {
                this.buffs[i] = buff;
                return;
            }
        }
        this.buffs.push(buff);
    }
    removeBuff(buff) {
        for (let i = this.buffs.length - 1; i >= 0; i--) {
            if (this.buffs[i].name == buff.name) {
                this.buffs.splice(i, 1)
                return;
            }
        }
    }
    canHaveBonus(bonusKey) {
        return !!this.talents[bonusKey];
    }
    selectTarget() {
        if (this.target != null && this.target.life > 0) {
            return this.target;
        }
        if (!this.isVilain) {
            this.target = mobs.find(p => p.life > 0);
            return this.target;
        }
        let minD = 100000000;
        for (let c of teams.filter(p => p.life > 0)) {
            const d = square(this.x - c.x) + square(this.y - c.y);
            if (d < minD) {
                this.target = c;
                minD = d;
            }
        }
        return this.target;
    }
}
class PnjSpell {
    constructor(stat, castFunc) {
        this.stat = stat;
        this.cooldown = stat.cooldown;
        this.tick = 0;
        this.castFunc = castFunc;
        this.nextCastTick = this.cooldown;
    }
    update(pnj) {
        this.tick++;
        if (this.tick >= this.nextCastTick) {
            this.tick = 0;
            this.nextCastTick = Math.ceil(this.cooldown * (100 + pnj.slow) / (100 + pnj.haste)) + (Math.random() < 0.5 ? 1 : 0);
            this.castFunc(this.stat, pnj);
        }
    }
}
class ProjectileStat {
    constructor(from, icon, dmg, cooldown, speed) {
        this.from = from;
        this.icon = icon;
        this.dmg = dmg;
        this.cooldown = cooldown;
        this.speed = speed;
        this.hitFunc = null;
    }
}
class KnightInvulnerableTrigger {
    constructor() {
        this.tick = 0;
        this.cooldown = 5 * 30;
        this.progress = 0;
    }
    update(pnj) {
        if (pnj.ultimatePower != 1) {
            return;
        }
        this.tick++;
        if (this.tick < this.cooldown) {
            return;
        }
        if (pnj.isInvulnerable) {
            pnj.isInvulnerable = false;
            return;
        }
        this.tick = 0;
        this.progress += Math.floor(15 + Math.random() * 30);
        if (this.progress < 100) {
            return;
        }
        this.progress -= 100;
        pnj.isInvulnerable = true;
        const buff = new CharacterBuffEffect("Invulnerable", pnj, invulnerableSprite, this.cooldown, this.cooldown, {},
            `Invulnerable for 5 sec`, function () { });
        pnj.pushBuff(buff);
    }
}
let allAnimations = [];
class ProjectileAnim {
    constructor(stat, from, to) {
        this.stat = stat;
        this.from = from;
        this.to = to;
        this.x = from.x + from.width / 2;
        this.y = from.y + (from.height - stat.icon.tHeight) / 2;
        this.destX = to.x + to.width / 2;
        this.destY = to.y + (to.height - stat.icon.tHeight) / 2;
        this.targetAngus = Math.atan2(this.destY - this.y, this.destX - this.x);
    }
    update() {
        const d = Math.sqrt(square(this.destX - this.x) + square(this.destY - this.y));
        if (d < this.stat.speed) {
            this.to.onHit(this.stat);
            return true;
        }
        this.x += (this.destX - this.x) * this.stat.speed / d;
        this.y += (this.destY - this.y) * this.stat.speed / d;
        return false;
    }
    paint() {
        this.stat.icon.paintRotate(this.x, this.y, this.targetAngus + Math.PI / 2);
    }
}
class LabelAnim {
    constructor(label, from, type, power) {
        this.label = label;
        this.x = from.x + from.width / 2 - label.length * 3;
        this.y = from.y - 5
        this.tick = 0;
        this.color = "darkorange";
        this.font = "12px Arial";
        switch (type) {
            case "hit":
                this.color = "darkorange";
                if (power < 20) {
                    this.font = "10px Arial";
                } else if (power < 50) {
                    this.font = "12px Arial";
                } else if (power < 150) {
                    this.font = "14px Arial";
                } else if (power < 250) {
                    this.font = "16px Arial";
                } else {
                    this.color = "red";
                    this.font = "24px Arial";
                }
                break;
            case "crit":
                this.color = "red";
                if (power < 20) {
                    this.font = "14px Arial";
                } else if (power < 50) {
                    this.font = "18px Arial";
                } else if (power < 150) {
                    this.font = "10px Arial";
                } else if (power < 250) {
                    this.font = "22px Arial";
                } else {
                    this.font = "24px Arial";
                }
                break;
            case "heal":
                this.color = "green";
                if (power < 50) {
                    this.font = "10px Arial";
                } else if (power < 90) {
                    this.font = "12px Arial";
                } else if (power < 200) {
                    this.font = "14px Arial";
                } else if (power < 400) {
                    this.font = "16px Arial";
                } else {
                    this.font = "18px Arial";
                }
                break;
            case "critHeal":
                this.color = "green";
                if (power < 50) {
                    this.font = "14px Arial";
                } else if (power < 90) {
                    this.font = "16px Arial";
                } else if (power < 200) {
                    this.font = "18px Arial";
                } else if (power < 400) {
                    this.font = "20px Arial";
                } else {
                    this.font = "24px Arial";
                }
                break;
            case "dodge": this.color = "gray"; break;
            case "block": this.color = "gray"; break;
            case "invulnerable": this.color = "orange"; break;
        }
        this.vx = Math.random() * 0.6 - 0.3;
        this.vy = 1.5;
    }
    update() {
        this.tick++;
        if (this.tick > 30 * 1) {
            return true;
        }
        this.x += this.vx;
        this.y -= this.vy;
        return false;
    }
    paint() {
        ctx.fillStyle = this.color;
        ctx.font = this.font;
        ctx.fillText(this.label, Math.floor(this.x), Math.floor(this.y));
    }
}
class Heroes {
    constructor() {
        this.usedNames = [];
    }
    createPelin() {
        const c = new Character("Pelin", "Healer", healerSprite);
        c.maxLife = c.life = 800;
        const wood = new Sprite(tileSet2, 0, 544, 32, 32, 1);
        wood.forbidRotate = true;
        c.spells.push(new PnjSpell(new ProjectileStat(c, wood, 15, 45, 10), castSimpleProjectile));
        c.talents = {
            life: 1,
            mana: 1,
            regen: 1,
            healPower: 1,
            haste: 1,
            crit: 1,
        };
        return c;
    }
    getName(names) {
        for (let name of names) {
            if (this.usedNames.indexOf(name) == -1) {
                return name;
            }
        }
        for (let name of names) {
            if (!teams.find(p => p.name == name)) {
                return name;
            }
        }
        return names[getRandomInt(0, names.length)];
    }
    createKnight() {
        const name = this.getName(["Arthur", "Lancelot", "Perceval", "Tristan"]);
        const c = new Character(name, "Knight", redKnightSprite);
        c.maxLife = c.life = 1000;
        c.armor = 10;
        c.isTank = true;
        c.spells.push(new PnjSpell(new ProjectileStat(c, swordSprite, 30, 38, 7), castSimpleProjectile));
        c.spells.push(new KnightInvulnerableTrigger());
        c.talents = {
            life: 1,
            invulnerable: 1,
            armor: 1,
            dodge: 1,
            damage: 1,
        };
        return c;
    }
    createWitch() {
        const name = this.getName(["Lilith", "Hecate", "Morgan", "Baba"]);
        const c = new Character(name, "Witch", witchSprite);
        c.maxLife = c.life = 600;
        c.ultimatePower = 10;
        const projectile = new ProjectileStat(c, frostSprite, 40, 44, 12);
        projectile.hitFunc = function (target) {
            target.slow = c.ultimatePower;
            const buff = new CharacterBuffEffect("Frozen", target, frostSprite, 60, 60, {}, `Slow attacks by ${c.ultimatePower}%`, function () {
                target.slow = 0;
            });
            buff.isBonus = false;
            target.pushBuff(buff);
        };
        c.spells.push(new PnjSpell(projectile, castSimpleProjectile));
        c.talents = {
            life: 1,
            frostBuff: 1,
            armor: 1,
            damage: 1,
            haste: 1,
            crit: 1,
        };
        return c;
    }
    createHunter() {
        const name = this.getName(["Heming", "Robin", "Leo"]);
        const c = new Character(name, "Hunter", elfSprite);
        c.maxLife = c.life = 700;
        c.ultimatePower = 10;
        const projectile = new ProjectileStat(c, arrowSprite, 50, 38, 10)
        projectile.hitFunc = function (target) {
            target.armorBroken = c.ultimatePower;
            const buff = new CharacterBuffEffect("Broken Armor", target, brokenArmorSprite, 60, 60, {}, `Reduce armor by ${c.ultimatePower}%`, function () {
                target.armorBroken = 0;
            });
            buff.isBonus = false;
            target.pushBuff(buff);
        };
        c.spells.push(new PnjSpell(projectile, castSimpleProjectile));
        c.talents = {
            life: 1,
            breakArmorBuff: 1,
            armor: 1,
            dodge: 1,
            damage: 1,
            haste: 1,
            crit: 1,
        };
        return c;
    }
    createBerserker() {
        const name = this.getName(["Ragnak", "Erik", "Vald", "Gorm"]);
        const c = new Character(name, "Berserker", berserkerSprite1);
        c.maxLife = c.life = 950;
        c.isBerserker = true;
        c.isTank = true;
        c.berserkArmor = 43;
        const projectile = new ProjectileStat(c, axeSprite, 40, 37, 7);
        c.spells.push(new PnjSpell(projectile, castSimpleProjectile));
        c.onUpdate = function () {
            const shouldBeBerserk = c.life <= c.maxLife / 2;
            if (shouldBeBerserk == c.isBerserk) {
                return;
            }
            const buff = new CharacterBuffEffect("Berserk", c, berserkerSprite2, 600000, 600000, {},
                `Boost base damage and armor`, function () { });
            if (shouldBeBerserk) {
                c.pushBuff(buff);
                c.isBerserk = true;
                c.sprite = berserkerSprite2;
            } else {
                c.removeBuff(buff);
                c.sprite = berserkerSprite1;
                c.isBerserk = false;
            }
        };
        c.talents = {
            life: 1,
            armor: 1,
            damage: 1,
            haste: 1,
            crit: 1,
            berserkArmor: 1,
        };
        return c;
    }
    createNecro() {
        const name = this.getName(["Eira", "Kaida", "Zara", "Calan"]);
        const c = new Character(name, "Necro", necroSprite);
        c.maxLife = c.life = 600;
        c.convertDeadIntoSkeletonChance = 25;
        c.ultimatePower = 1;
        const projectile = new ProjectileStat(c, skeletonSprite, 20, 60, 10);
        c.spells.push(new PnjSpell(projectile, function (stat, from) {
            const existings = allAnimations.filter(a => a.type == NecroSkeleton.AnymType);
            if (existings.length >= c.ultimatePower) {
                return;
            }
            const space = 50;
            const angus = Math.PI / 2 + existings.length * Math.PI * 2 / c.ultimatePower;
            const x = Math.floor(c.x + space * Math.cos(angus));
            const y = Math.floor(c.y + space * Math.sin(angus));
            const skeleton = new NecroSkeleton(c, x, y, existings.length + 1);
            allAnimations.push(skeleton);
        }));

        c.talents = {
            life: 1,
            armor: 1,
            dodge: 1,
            haste: 1,
            crit: 1,
            convertDeadIntoSkeleton: 1,
        };
        return c;
    }
}
class NecroSkeleton {
    static AnymType = "Skeleton";
    constructor(necro, x, y, id) {
        this.type = NecroSkeleton.AnymType;
        this.necro = necro;
        this.destX = x;
        this.destY = y;
        this.id = id;
        this.sprite = skeletonSprite;
        this.width = this.sprite.singleWidth;
        this.height = this.sprite.tHeight;
        this.x = necro.x;
        this.y = necro.y
        this.tick = 0;
        this.nextCastTick = 30;
        this.cooldown = 60;
        this.damage = 20;
    }
    update() {
        if (!this.move()) {
            this.castSpell();
        }
        return this.necro.life <= 0;
    }
    move() {
        if (this.x == this.destX && this.y == this.destY) {
            return false;
        }
        const d = Math.sqrt(square(this.destX - this.x) + square(this.destY - this.y));
        const speed = 3;
        if (d <= speed) {
            this.x = this.destX;
            this.y = this.destY;

        } else {
            this.x += (this.destX - this.x) * speed / d;
            this.y += (this.destY - this.y) * speed / d;
        }
        return true;
    }
    castSpell() {
        this.tick++;
        if (this.tick >= this.nextCastTick) {
            this.tick = 0;
            this.nextCastTick = this.getCooldown() + Math.floor(Math.random() * 10 - 5);
            let target = this.necro.selectTarget();
            if (!target) {
                return;
            }
            const boneStat = new ProjectileStat(this.necro, boneSprite, this.damage, this.cooldown, 6);
            const projectile = new ProjectileAnim(boneStat, this, target);
            allAnimations.push(projectile);
        }
    }
    getCooldown() {
        return Math.floor(this.cooldown * 100 / (100 + this.necro.haste));
    }
    paint() {
        let spriteNumber = Math.floor(tickNumber / 8) % 2;
        this.sprite.paint(this.x, this.y, spriteNumber);
    }
    click(event) {
        if (isInside(this, event)) {
            tooltip.current = new SkeletonTooltip(this);
            tooltip.isMinimized = false;
            return true;
        }
    }
}
let heroesFactory = new Heroes();
class UpgradeFactory {
    propose3UpgradesForPelin() {
        const upgrades = [];
        this.addSpells(upgrades);
        this.addLevelUpForTheHero(teams[0], upgrades);
        let selected = [];
        this.randomPick(upgrades, selected, 3);
        return selected;
    }
    propose3Upgrades() {
        // 0-1 of lvlup spell / recruit
        // 3-2 of level up options on one character
        const pnjs = [];
        this.addPnjs(pnjs);
        if (teams.length == 1) {
            let selected = [];
            this.randomPick(pnjs, selected, 3);
            return selected;
        }
        const heros = [];
        this.addLevelUpForOneHero(heros);
        let selected = [];
        if (teams.length < 7) {
            let proba = teams.length <= 2 ? 1
                : teams.length <= 3 ? 0.7
                    : teams.length <= 4 ? 0.4
                        : 0.3;
            if (!teams.find(p => p.isTank) || Math.random() < 0.6) {
                this.randomPick(pnjs, selected, 1);
            }
        }
        this.randomPick(heros, selected, 3);
        return selected;
    }
    randomPick(array, selected, n) {
        for (let i = 0; i < n && array.length > 0 && selected.length < 3; i++) {
            let r = getRandomInt(0, array.length);
            selected.push(array[r]);
            array.splice(r, 1);
        }
    }
    click(upgrade) {
        upgrade.click();
    }
    addPnjs(array) {
        if (!teams.find(p => p.isTank)) {
            array.push(this.addKnight());
            array.push(this.addBerserker());
        }
        array.push(this.addWitch());
        array.push(this.addHunter());
        array.push(this.addNecro());
    }
    proposePnj(pnj, desc) {
        return {
            sprite: pnj.sprite,
            verb: "Recruit",
            verbIcon: recruitSprite,
            desc: desc,
            click: () => {
                teams.push(pnj);
                heroesFactory.usedNames.push(pnj.name);
            }
        };
    }
    addKnight() {
        const c = heroesFactory.createKnight();
        return this.proposePnj(c, ["Recruit a new knight", "He can periodically", "became invulnerable", "thanks to his shield"]);
    }
    addWitch() {
        const c = heroesFactory.createWitch();
        return this.proposePnj(c, ["Recruit a new witch", "She can slow the", "attacks of the ennemy"]);
    }
    addHunter() {
        const c = heroesFactory.createHunter();
        return this.proposePnj(c, ["Recruit a new hunter", "He can reduce the", "armor of the ennemy"]);
    }
    addBerserker() {
        const c = heroesFactory.createBerserker();
        return this.proposePnj(c, ["Recruit a new berserker", "A tank that double its",
            "damages and have a", "damage reduction when", "below half life"]);
    }
    addNecro() {
        const c = heroesFactory.createNecro();
        return this.proposePnj(c, ["Recruit a new necromancer", "The Necro collects bones", "of dying hero or monster", "to summons skeletons"]);
    }
    proposeSpell(spell, desc) {
        return {
            sprite: spell.icon,
            verb: "Learn",
            verbIcon: learnSpellSprite,
            desc: desc,
            click: () => {
                playerSpells.push(spell);
            }
        };
    }
    addSpells(array) {
        if (playerSpells.length >= 5) {
            return;
        }
        if (playerSpells.indexOf(fastHeal2) == -1) {
            array.push(this.proposeSpell(fastHeal2, ["Fast Heal level 2", `Heals ${fastHeal2.power}`, `Mana: ${fastHeal2.mana}`]));
        }
        if (playerSpells.indexOf(slowHeal1) == -1) {
            array.push(this.proposeSpell(slowHeal1, ["Slow Heal", `Heals ${slowHeal1.power}`, `Mana: ${slowHeal1.mana}`]));
        } else if (playerSpells.indexOf(slowHeal2) == -1) {
            array.push(this.proposeSpell(slowHeal2, ["Slow Heal level 2", `Heals ${slowHeal2.power}`, `Mana: ${slowHeal2.mana}`]));
        }
        if (playerSpells.indexOf(aoeHeal) == -1) {
            array.push(this.proposeSpell(aoeHeal, ["Group Heal", `Share ${aoeHeal.power} heals`, `Mana: ${aoeHeal.mana}`]));
        }
    }
    pushLevelUp(array, hero, desc, action, verbIcon) {
        array.push({
            sprite: hero.sprite,
            verb: "Level up",
            verbIcon: verbIcon,
            desc: desc,
            click: () => {
                hero.level++;
                action();
            }
        });
    }
    addLevelUpForOneHero(array) {
        if (teams.length <= 1) {
            return;
        }
        const hero = teams[getRandomInt(1, teams.length)];// Not Pelin
        this.addLevelUpForTheHero(hero, array);
    }
    addLevelUpForTheHero(hero, array) {
        if (hero.canHaveBonus("life")) {
            let incr = 50 + Math.floor(Math.random() * 5) * 50;
            this.pushLevelUp(array, hero, [`Level up ${hero.name} to level ${hero.level + 1}`, `Increase max life of ${hero.name}`,
            `From ${hero.maxLife}`, `To ${hero.maxLife + incr}`], function () {
                hero.maxLife += incr;
            }, lifeBonusSprite);
        }
        if (hero.canHaveBonus("armor")) {
            let incr = (hero.armor < 50 ? 10 : 20) + Math.floor(Math.random() * 5) * 5;
            this.pushLevelUp(array, hero, [`Level up ${hero.name} to level ${hero.level + 1}`, `Increase armor of ${hero.name}`,
            `From ${hero.armor}`, `To ${hero.armor + incr}`], function () {
                hero.armor += incr;
            }, armorSprite);
        }
        if (hero.canHaveBonus("damage")) {
            let incr = 5 + Math.floor(Math.random() * 4) * 5;
            this.pushLevelUp(array, hero, [`Level up ${hero.name} to level ${hero.level + 1}`, `Increase damage of ${hero.name}`,
            `From ${hero.spells[0].stat.dmg}`, `To ${hero.spells[0].stat.dmg + incr}`], function () {
                hero.spells[0].stat.dmg += incr;
            }, damageBonusSprite);
        }
        if (hero.canHaveBonus("crit")) {
            let incr = 10 + Math.floor(Math.random() * 5) * 5;
            const newValue = hero.crit + incr;
            if (newValue <= 100) {
                this.pushLevelUp(array, hero, [`Level up ${hero.name} to level ${hero.level + 1}`, `Increase critical chance`,
                `From ${hero.crit} %`, `To ${newValue} %`], function () {
                    hero.crit += incr;
                }, critBonusSprite);
            }
        }
        if (hero.canHaveBonus("dodge") && hero.dodge < 50) {
            let incr = 5 + Math.floor(Math.random() * 10);
            this.pushLevelUp(array, hero, [`Level up ${hero.name} to level ${hero.level + 1}`, `Increase dodge chance`,
            `From ${hero.dodge} %`, `To ${hero.dodge + incr} %`], function () {
                hero.dodge += incr;
            }, dodgeSprite);
        }
        if (hero.canHaveBonus("haste")) {
            let incr = 10 + Math.floor(Math.random() * 20);
            this.pushLevelUp(array, hero, [`Level up ${hero.name} to level ${hero.level + 1}`, `Increase haste`,
            `From ${hero.haste}`, `To ${hero.haste + incr}`], function () {
                hero.haste += incr;
            }, hasteBuffSprite);
        }
        if (hero.canHaveBonus("mana")) {
            let incr = 80 + Math.floor(Math.random() * 8) * 10;
            this.pushLevelUp(array, hero, [`Level up ${hero.name} to level ${hero.level + 1}`, `Increase mana`,
            `From ${playerStat.maxMana}`, `To ${playerStat.maxMana + incr}`], function () {
                playerStat.maxMana += incr;
            }, manaBonusSprite);
        }
        if (hero.canHaveBonus("regen")) {
            let incr = 2 + Math.random() * 4;
            let liteIncr = Math.floor(incr);
            let fullIncr = Math.floor(incr * 4);
            this.pushLevelUp(array, hero, [`Level up ${hero.name} to level ${hero.level + 1}`,
                `Increase mana regen`, `From ${playerStat.fullManaRegen} mana/s`, `To ${playerStat.fullManaRegen + fullIncr} mana/s`],
                function () {
                    playerStat.liteManaRegen += liteIncr;
                    playerStat.fullManaRegen += fullIncr;
                }, manaRegenBonusSprite);
        }
        if (hero.canHaveBonus("healPower")) {
            let incr = 10 + Math.floor(Math.random() * 15);
            this.pushLevelUp(array, hero, [`Level up ${hero.name} to level ${hero.level + 1}`,
                `Increase heal bonus`, `From ${playerStat.healPower} %`, `To ${playerStat.healPower + incr} %`], function () {
                    playerStat.healPower += incr;
                }, healPowerBonusSprite);
        }
        if (hero.canHaveBonus("convertDeadIntoSkeleton")) {
            let incr = 10 + Math.floor(Math.random() * 25);
            let oldValue = hero.convertDeadIntoSkeletonChance;
            let range = 40;
            let newValue = hero.convertDeadIntoSkeletonChance + incr;

            if (newValue <= 100) {
                this.pushLevelUp(array, hero, [
                    `Level up ${hero.name} to level ${hero.level + 1}`,
                    `Increase the number of `,
                    `collected bones on death.`,
                    `Mob:[${oldValue}-${oldValue + range}]->[${newValue}-${newValue + range}]`,
                    `Ally:[${oldValue * 3}-${oldValue * 3 + range}]->[${newValue * 3}-${newValue * 3 + range}]`,
                ], function () {
                    playerStat.convertDeadIntoSkeletonChance += incr;
                }, skeletonSprite);
            }
        }
        if (hero.canHaveBonus("berserkArmor")) {
            const incr = 30 + Math.floor(Math.random() * 50);
            const oldReduc = Math.floor(100 - 100 * 100 / (100 + hero.berserkArmor));
            const newReduc = Math.floor(100 - 100 * 100 / (100 + hero.berserkArmor + incr));
            this.pushLevelUp(array, hero, [`Level up ${hero.name} to level ${hero.level + 1}`,
                `Increase damage reduction`, `when under berserk effect`, `From ${oldReduc} %`, `To ${newReduc} %`], function () {
                    playerStat.berserkArmor += incr;
                }, berserkerSprite2);
        }

        if (hero.level >= 3) {
            if (hero.talents.invulnerable == 1 && hero.ultimatePower != 1) {
                this.pushLevelUp(array, hero, [`Level up ${hero.name} to level ${hero.level + 1}`, `Learn to shield`,
                    `30% chance to became`, `invulnerable for 5 seconds`], function () {
                        hero.ultimatePower = 1;
                    }, invulnerableSprite);
            }
            if (hero.talents.frostBuff >= 1 && hero.talents.frostBuff < 3) {
                let incr = 10;
                this.pushLevelUp(array, hero, [`Level up ${hero.name} to level ${hero.level + 1}`, `Increase slow debuff`,
                `From ${hero.ultimatePower} %`, `To ${hero.ultimatePower + incr} %`], function () {
                    hero.talents.frostBuff++;
                    hero.ultimatePower += incr;
                }, frostSprite);
            }
            if (hero.talents.breakArmorBuff >= 1 && hero.talents.breakArmorBuff < 3) {
                let incr = 20;
                this.pushLevelUp(array, hero, [`Level up ${hero.name} to level ${hero.level + 1}`, `Increase breaking armor`,
                `From ${hero.ultimatePower} %`, `To ${hero.ultimatePower + incr} %`], function () {
                    hero.talents.breakArmorBuff++;
                    hero.ultimatePower += incr;
                }, brokenArmorSprite);
            }
        }
    }
}
let upgradeFactory = new UpgradeFactory();
let rerollsNumber = 2;
class Vilains {
    constructor() {
        this.factory = [
            Vilains.lvl1,
            Vilains.lvl2,
            Vilains.lvl3,
            Vilains.lvl4,
            Vilains.lvl5,
            Vilains.lvl6,
            Vilains.lvl7,
            Vilains.lvl8,
            Vilains.lvl9,
            Vilains.lvl10,
            Vilains.giantOrc,
            Vilains.lvl12,
            Vilains.lvl13,
            Vilains.lvl14,
            Vilains.lvl15,
            Vilains.lvl16,
            Vilains.lvl17,
            Vilains.lvl18,
            Vilains.lvl19,
            Vilains.bigZombie,
            Vilains.giantDemon
        ];
    }
    isLastLevel(level) {
        return level >= this.factory.length;
    }
    levelCount() {
        return this.factory.length;
    }
    createVilainOfLevel(level) {
        const vilain = this.factory[(level - 1) % this.factory.length]();

        vilain.reverse = true;
        vilain.isVilain = true;
        vilain.level = level;
        const params = new URLSearchParams(window.location.search);
        const cheating = params.get("cheat");
        if (cheating && level < cheating) {
            vilain.maxLife = 10;
        }

        vilain.life = vilain.maxLife;
        return vilain;
    }
    static lvl1() {
        const sprite = new Sprite(tileSet1, 736, 32, 64, 48, 2);
        let vilain = new Character("Brown Bag", "Monster", sprite);
        vilain.maxLife = 100;
        vilain.spells.push(new PnjSpell(new ProjectileStat(vilain, knifeSprite, 80, 40, 7), castSimpleProjectile));
        vilain.spells.push(new FireballAoeTrigger(0.5, 250));
        return vilain;
    }
    static lvl2() {
        const sprite = new Sprite(tileSet1, 736, 80, 64, 48, 2);
        let vilain = new Character("Green Bag", "Monster", sprite);
        vilain.maxLife = 300;
        vilain.armor = 10;
        vilain.spells.push(new PnjSpell(new ProjectileStat(vilain, knifeSprite, 100, 30, 7), castSimpleProjectile));
        vilain.spells.push(new FireballAoeTrigger(0.5, 60));
        return vilain;
    }
    static lvl3() {
        const sprite = new Sprite(tileSet1, 736, 124, 64, 48, 2);
        let vilain = new Character("Small Devil", "Monster", sprite);
        vilain.maxLife = 500;
        vilain.armor = 20;
        vilain.spells.push(new PnjSpell(new ProjectileStat(vilain, knifeSprite, 60, 30, 7), castSimpleProjectile));
        vilain.spells.push(new HasteBuffTrigger(0.5, 400, 1000000));
        return vilain;
    }
    static lvl4() {
        const sprite = new Sprite(tileSet1, 736, 220, 64, 36, 2);
        let vilain = new Character("Brown Mud", "Monster", sprite);
        vilain.maxLife = 800;
        vilain.armor = 40;
        vilain.spells.push(new PnjSpell(new ProjectileStat(vilain, greenPotionSprite, 100, 60, 7), castSimpleProjectile));
        vilain.spells.push(new HasteBuffTrigger(0.3, 300, 30 * 6));
        return vilain;
    }
    static lvl5() {
        const sprite = new Sprite(tileSet1, 928, 220, 64, 36, 2);
        let vilain = new Character("Poison Mud", "Monster", sprite);
        vilain.maxLife = 1000;
        vilain.armor = 50;
        vilain.spells.push(new PnjSpell(new ProjectileStat(vilain, greenPotionSprite, 100, 40, 7), castSimpleProjectile));
        vilain.spells.push(new FireballAoeTrigger(0.5, 85));
        Vilains.addDpsCheckLimit(vilain, 25);
        return vilain;
    }
    static lvl6() {
        const sprite = new Sprite(tileSet1, 736, 264, 64, 44, 2);
        let vilain = new Character("Crying Mummy", "Monster", sprite);
        vilain.maxLife = 1200;
        vilain.armor = 60;
        vilain.spells.push(new PnjSpell(new ProjectileStat(vilain, greenPotionSprite, 100, 40, 7), castSimpleProjectile));
        vilain.spells.push(new HasteBuffTrigger(0.3, 300, 30 * 6));
        return vilain;
    }
    static lvl7() {
        const sprite = new Sprite(tileSet1, 860, 264, 64, 44, 2);
        let vilain = new Character("Frost Mummy", "Monster", sprite);
        vilain.maxLife = 1300;
        vilain.armor = 60;
        vilain.spells.push(new PnjSpell(new ProjectileStat(vilain, greenPotionSprite, 110, 40, 7), castSimpleProjectile));
        vilain.spells.push(new FireballAoeTrigger(0.9, 50));
        return vilain;
    }
    static lvl8() {
        const sprite = new Sprite(tileSet1, 736, 360, 64, 48, 2);
        let vilain = new Character("Orc", "Monster", sprite);
        vilain.maxLife = 1400;
        vilain.armor = 70;
        vilain.spells.push(new PnjSpell(new ProjectileStat(vilain, greenPotionSprite, 120, 40, 7), castSimpleProjectile));
        vilain.spells.push(new HasteBuffTrigger(0.3, 300, 30 * 6));
        return vilain;
    }
    static lvl9() {
        const sprite = new Sprite(tileSet1, 736, 312, 64, 48, 2);
        let vilain = new Character("Chaman Orc", "Monster", sprite);
        vilain.maxLife = 1500;
        vilain.armor = 50;
        vilain.spells.push(new PnjSpell(new ProjectileStat(vilain, greenPotionSprite, 130, 40, 7), castSimpleProjectile));
        vilain.spells.push(new RandomAttackTrigger(0.8, 500, 100));
        return vilain;
    }
    static lvl10() {
        const sprite = new Sprite(tileSet1, 736, 412, 64, 48, 2);
        let vilain = new Character("Enraged Orc", "Monster", sprite);
        vilain.maxLife = 1600;
        vilain.armor = 80;
        vilain.spells.push(new PnjSpell(new ProjectileStat(vilain, greenPotionSprite, 80, 40, 7), castSimpleProjectile));
        vilain.spells.push(new FireballAoeTrigger(0.8, 80));
        Vilains.addDpsCheckLimit(vilain, 40);
        return vilain;
    }
    static giantOrc() {
        const sprite = new Sprite(tileSet1, 40, 768, 492, 68, 8);
        let vilain = new Character("Giant Orc", "Monster", sprite);
        vilain.maxLife = 2000;
        vilain.armor = 80;
        vilain.spells.push(new PnjSpell(new ProjectileStat(vilain, greenPotionSprite, 120, 40, 7), castSimpleProjectile));
        vilain.spells.push(new HasteBuffTrigger(0.3, 300, 30 * 6));
        vilain.spells.push(new OnLoseLifeAoeTrigger(25, 150));
        Vilains.addInvulnerableBuff(vilain, 6);
        return vilain;
    }
    static lvl12() {
        const sprite = new Sprite(tileSet1, 736, 454, 64, 48, 2);
        let vilain = new Character("Dark Wizard", "Monster", sprite);
        vilain.maxLife = 1700;
        vilain.armor = 40;
        vilain.spells.push(new PnjSpell(new ProjectileStat(vilain, greenPotionSprite, 200, 40, 7), castSimpleProjectile));
        vilain.spells.push(new RandomAttackTrigger(0.7, 500, 80));
        return vilain;
    }
    static lvl13() {
        const sprite = new Sprite(tileSet1, 736, 504, 64, 48, 2);
        let vilain = new Character("The Thing", "Monster", sprite);
        vilain.maxLife = 2000;
        vilain.armor = 80;
        vilain.spells.push(new PnjSpell(new ProjectileStat(vilain, greenPotionSprite, 140, 40, 7), castSimpleProjectile));
        vilain.spells.push(new HasteBuffTrigger(0.3, 300, 30 * 5));
        Vilains.addInvulnerableBuff(vilain, 8);
        return vilain;
    }
    static lvl14() {
        const sprite = new Sprite(tileSet1, 736, 552, 64, 48, 2);
        let vilain = new Character("Little Devil", "Monster", sprite);
        vilain.maxLife = 2200;
        vilain.armor = 80;
        vilain.spells.push(new PnjSpell(new ProjectileStat(vilain, greenPotionSprite, 150, 40, 7), castSimpleProjectile));
        vilain.spells.push(new FireballAoeTrigger(0.4, 100));
        return vilain;
    }
    static lvl15() {
        const sprite = new Sprite(tileSet1, 736, 604, 64, 36, 2);
        let vilain = new Character("Death Angel", "Monster", sprite);
        vilain.maxLife = 1500;
        vilain.armor = 40;
        vilain.spells.push(new PnjSpell(new ProjectileStat(vilain, greenPotionSprite, 80, 40, 7), castSimpleProjectile));
        vilain.spells.push(new RandomAttackTrigger(0.7, 500, 150));
        vilain.spells.push(new HasteBuffTrigger(0.4, 100, 1000000));
        Vilains.addInvulnerableBuff(vilain, 8);
        return vilain;
    }
    static lvl16() {
        const sprite = new Sprite(tileSet1, 736, 644, 64, 48, 2);
        let vilain = new Character("Punk-in", "Monster", sprite);
        vilain.maxLife = 2500;
        vilain.armor = 100;
        vilain.spells.push(new PnjSpell(new ProjectileStat(vilain, greenPotionSprite, 150, 40, 7), castSimpleProjectile));
        vilain.spells.push(new FireballAoeTrigger(0.9, 30));
        Vilains.addInvulnerableBuff(vilain, 10);
        return vilain;
    }
    static lvl17() {
        const sprite = new Sprite(tileSet1, 736, 696, 64, 48, 2);
        let vilain = new Character("Mad Doctor", "Monster", sprite);
        vilain.maxLife = 2500;
        vilain.armor = 50;
        vilain.spells.push(new PnjSpell(new ProjectileStat(vilain, greenPotionSprite, 250, 50, 7), castSimpleProjectile));
        vilain.spells.push(new FireballAoeTrigger(0.6, 50));
        vilain.spells.push(new HasteBuffTrigger(0.3, 150, 30 * 5));
        Vilains.addInvulnerableBuff(vilain, 12);
        return vilain;
    }
    static lvl18() {
        const sprite = new Sprite(tileSet1, 256, 408, 64, 44, 2);
        let vilain = new Character("Mad Reptil", "Monster", sprite);
        vilain.maxLife = 3000;
        vilain.armor = 100;
        vilain.spells.push(new PnjSpell(new ProjectileStat(vilain, greenPotionSprite, 100, 25, 7), castSimpleProjectile));
        vilain.spells.push(new FireballAoeTrigger(0.5, 60));
        vilain.spells.push(new HasteBuffTrigger(0.3, 150, 30 * 5));
        Vilains.addInvulnerableBuff(vilain, 8);
        return vilain;
    }
    static lvl19() {
        const sprite = new Sprite(tileSet1, 736, 746, 64, 48, 2);
        let vilain = new Character("Snail", "Monster", sprite);
        vilain.maxLife = 4000;
        vilain.armor = 200;
        vilain.spells.push(new PnjSpell(new ProjectileStat(vilain, greenPotionSprite, 300, 80, 7), castSimpleProjectile));
        vilain.spells.push(new FireballAoeTrigger(0.75, 50));
        vilain.spells.push(new OnLoseLifeAoeTrigger(15, 100));
        Vilains.addDpsCheckLimit(vilain, 50);
        return vilain;
    }
    static bigZombie() {
        const sprite = new Sprite(tileSet1, 40, 668, 492, 68, 8);
        let vilain = new Character("Big Zombie", "Monster", sprite);
        vilain.maxLife = 5000;
        vilain.armor = 100;
        vilain.spells.push(new PnjSpell(new ProjectileStat(vilain, hamerSprite, 200, 50, 7), castSimpleProjectile));
        vilain.spells.push(new FireballAoeTrigger(0.4, 70));
        Vilains.addInvulnerableBuff(vilain, 10);
        return vilain;
    }
    static giantDemon() {
        const sprite = new Sprite(tileSet1, 40, 856, 492, 68, 8);
        let vilain = new Character("Final boss", "Monster", sprite);
        vilain.maxLife = 10000;
        vilain.armor = 100;
        vilain.spells.push(new PnjSpell(new ProjectileStat(vilain, greenPotionSprite, 150, 30, 7), castSimpleProjectile));
        vilain.spells.push(new FireballAoeTrigger(0.5, 50));
        vilain.spells.push(new HasteBuffTrigger(0.3, 200, 30 * 5));
        vilain.spells.push(new RandomAttackTrigger(0.7, 250, 10 * 30));
        vilain.spells.push(new OnLoseLifeAoeTrigger(10, 150));
        Vilains.addInvulnerableBuff(vilain, 12);
        return vilain;
    }
    static addInvulnerableBuff(vilain, duration) {
        vilain.spells.push(new BossInvulnerableBuffTrigger([20, 40, 75], duration * 30));
    }
    static addDpsCheckLimit(vilain, timeLimitInSec) {
        vilain.animationsToStartOnInit.push(new BigBombTimeLimitAnim(vilain, timeLimitInSec));
    }
}
const vilainsFactory = new Vilains();
let currentLevel = 1;
let teams = [];
let mobs = [];
let characterMenus = [];
function castSimpleProjectile(stat, from) {
    let target = from.selectTarget();
    if (!target) return;
    const projectile = new ProjectileAnim(stat, from, target);
    allAnimations.push(projectile);
}
class FireballAoeTrigger {
    constructor(lifeRatio, dmg) {
        this.lifeRatio = lifeRatio;
        this.dmg = dmg;
        this.sprite = fireballSprite;
        this.cooldown = 45;
    }
    update(self) {
        if (self.isEnragedAoe) {
            return;
        }
        if (self.life > self.maxLife * this.lifeRatio) {
            return;
        }
        self.isEnragedAoe = true;
        const stat = new ProjectileStat(self, this.sprite, this.dmg, this.cooldown, 15)
        self.pushBuff(new CharacterBuffEffect("Hellfire", self, this.sprite, this.cooldown, 100000, stat,
            `Throw a ${this.dmg} fireball to all`, FireballAoeTrigger.fireTick));
    }
    static fireTick(stat, boss) {
        for (const c of teams) {
            if (c.life > 0) {
                const projectile = new ProjectileAnim(stat, boss, c);
                allAnimations.push(projectile);
            }
        }
    }
    getDescription() {
        const lifeRatio = Math.floor(100 * this.lifeRatio);
        const cooldown = Math.floor(this.cooldown / 30).toFixed(1);
        return {
            icon: this.sprite,
            title: "Hellfire",
            desc: [`Once at ${lifeRatio}% life`, `do ${this.dmg} to all players every ${cooldown} sec`]
        };
    }
}
class OnLoseLifeAoeTrigger {
    constructor(lifeRatio, dmg) {
        this.lifeRatio = lifeRatio;
        this.dmg = dmg;
        this.nextStep = null;
        this.sprite = loseLifeProjectileSprite;
    }
    update(self) {
        if (self.life <= 0) {
            return;
        }
        if (this.nextStep == null) {
            this.nextStep = 99;
            this.addBuffIcon(self);
        }
        if (100 * self.life / self.maxLife > this.nextStep) {
            return;
        }
        this.nextStep = Math.max(0, this.nextStep - this.lifeRatio);
        this.addBuffIcon(self);
        const stat = new ProjectileStat(self, this.sprite, this.dmg, 40, 15);
        for (const c of teams) {
            if (c.life > 0) {
                const projectile = new ProjectileAnim(stat, self, c);
                allAnimations.push(projectile);
            }
        }
    }
    addBuffIcon(self) {
        const nextStepLife = Math.floor(self.maxLife * this.nextStep / 100);
        self.pushBuff(new CharacterBuffEffect("Revenge", self, this.sprite, 15, 10000000, null,
            `Will hit ${this.dmg} at ${nextStepLife} life (${this.nextStep}%) `, () => { }));
    }
    getDescription() {
        return {
            icon: this.sprite,
            title: "Revenge",
            desc: [`Each ${this.lifeRatio}% life lost`, `do ${this.dmg} to all players`]
        };
    }
}
class RandomAttackTrigger {
    constructor(lifeRatio, dmg, cooldown) {
        this.lifeRatio = lifeRatio;
        this.dmg = dmg;
        this.cooldown = cooldown;
        this.triggered = false;
        this.sprite = bombSprite;
    }
    update(self) {
        if (this.triggered) {
            return;
        }
        if (self.life > self.maxLife * this.lifeRatio) {
            return;
        }
        this.triggered = true;
        const stat = new ProjectileStat(self, this.sprite, this.dmg, this.cooldown, 6);
        stat.lastTarget = null;
        self.pushBuff(new CharacterBuffEffect("Explosive", self, bombSprite, this.cooldown, 100000, stat,
            `Deal ${this.dmg} damage to random character`, RandomAttackTrigger.randomAttackTick));
    }
    static randomAttackTick(stat, boss) {
        const alive = teams.filter(c => c.life > 0 && c != stat.lastTarget && c != boss.target);
        if (alive.length == 0) {
            stat.lastTarget = null;
            return;
        }
        const target = alive[getRandomInt(0, alive.length)];
        stat.lastTarget = target;
        const projectile = new ProjectileAnim(stat, boss, target);
        allAnimations.push(projectile);
    }
    getDescription() {
        const lifeRatio = Math.floor(100 * this.lifeRatio);
        return {
            icon: this.sprite,
            title: "Random attack",
            desc: [`Once at ${lifeRatio}% life`, `do ${this.dmg} to random player`]
        };
    }
}
class HasteBuffTrigger {
    constructor(lifePeriodRatio, hasteIncr, duration) {
        this.lifePeriodRatio = lifePeriodRatio;
        this.hasteIncr = hasteIncr;
        this.duration = duration;
        this.nextLifeTrigger = null;
        this.period = null;
        this.isRunning = false;
        this.sprite = hasteBuffSprite;
    }
    update(self) {
        if (this.isRunning) {
            return;
        }
        if (this.nextLifeTrigger == null) {
            this.period = Math.floor(self.maxLife * this.lifePeriodRatio);
            this.nextLifeTrigger = self.maxLife - this.period;
        }
        if (self.life > this.nextLifeTrigger) {
            return;
        }
        this.nextLifeTrigger -= this.period;
        this.isRunning = true;
        self.haste += this.hasteIncr;
        const spell = this;
        const buff = new CharacterBuffEffect("Haste", self, this.sprite, this.duration, this.duration, {}, `Gain ${spell.hasteIncr} haste`, function () {
            if (spell.isRunning) {
                spell.isRunning = false;
                self.haste -= spell.hasteIncr;
            }
        });
        self.pushBuff(buff);
    }
    getDescription() {
        const lifeRatio = Math.floor(100 * this.lifePeriodRatio);
        return {
            icon: this.sprite,
            title: "Haste",
            desc: [`Gain ${this.hasteIncr} haste`, `every time he lost ${lifeRatio}% life`]
        };
    }
}
class BossInvulnerableBuffTrigger {
    constructor(lifeRatios, duration) {
        this.lifeRatios = lifeRatios;
        this.duration = duration;
        this.nextLifeTrigger = null;
        this.sprite = invulnerableSprite;
    }
    update(self) {
        if (this.nextLifeTrigger == null) {
            this.setNextTrigger(self);
        }
        if (self.life > this.nextLifeTrigger) {
            return;
        }
        this.isDone = true;
        self.isInvulnerable = true;
        const durationSec = Math.floor(this.duration / 3) / 10;
        const buff = new CharacterBuffEffect("Invulnerable", self, this.sprite, this.duration, this.duration, {},
            `Invulnerable for ${durationSec} sec`, function () {
                self.isInvulnerable = false;
            });
        self.pushBuff(buff);
        this.setNextTrigger(self);
    }
    setNextTrigger(boss) {
        for (let i = this.lifeRatios.length - 1; i >= 0; i--) {
            const lifeTrigger = Math.floor(boss.maxLife * this.lifeRatios[i] / 100);
            if (boss.life > lifeTrigger) {
                this.nextLifeTrigger = lifeTrigger;
                return;
            }
        }
        this.nextLifeTrigger = -1;
    }
    getDescription() {
        const durationSec = Math.floor(this.duration / 3) / 10;
        let ticks = "";
        for (let ratio of this.lifeRatios) {
            if (ticks != "") {
                ticks += ", ";
            }
            ticks += `${ratio}%`;
        }
        return {
            icon: this.sprite,
            title: "Invulnerable",
            desc: [`Invulnerable for ${durationSec} sec`, `at [${ticks}] life`]
        };
    }
}
class BigBombTimeLimitAnim {
    constructor(vilain, timeLimitInSec) {
        this.vilain = vilain;
        this.sprite = bigBombSprite;
        this.width = this.sprite.singleWidth;
        this.height = 64;
        this.x = 700;
        this.y = 200;        
        this.timeLimitInSec = timeLimitInSec;
        this.cooldown = timeLimitInSec * 30;
    }
    update() {
        if (this.vilain.life <= 5) {
            return false;
        }
        this.cooldown--;
        if (this.cooldown > 0) {
            return false;
        }
        return this.explode();
    }
    paint() {
        let spriteNumber = Math.floor(tickNumber / 8) % 2;
        this.sprite.paint(this.x, this.y + spriteNumber, spriteNumber);

        const sec = this.cooldown / 30;
        const label = this.cooldown > 0 ? sec.toFixed(1) : "BOOM!!!";
        ctx.fillStyle = sec < 12 ? "red" : sec < 20 ? "darkorange" : "black";
        const bigText = sec < 3;
        ctx.font = bigText ? "bold 18px Courier New" : "14px Tahoma";
        if (!bigText || (tickNumber % 10) < 6) {
            ctx.fillText(label, this.x + 22 - label.length * (bigText ? 5 : 4), this.y + 48 + (bigText ? 2 : 0));
        }
    }
    explode() {
        if (Math.abs(this.cooldown) % 5 != 0) {
            return;
        }
        let anyAlive = false;
        for (const c of teams) {
            if (c.life > 0) {
                const stat = new ProjectileStat(self, bombSprite, 314159265, 1, 10);
                const projectile = new ProjectileAnim(stat, this, c);
                allAnimations.push(projectile);
                anyAlive = true;
            }
        }
        return !anyAlive;
    }
    click(event) {
        if (isInside(this, event)) {
            tooltip.current = new BigBombTooltip(this);
            tooltip.isMinimized = false;
            return true;
        }
    }
    getDescription() {
        return {
            icon: this.sprite,
            title: `Time limit`,
            desc: [`Fatal explosion after ${this.timeLimitInSec} seconds`]
        };
    }
}
class PlayerSpell {
    constructor(name, fullName, icon, mana, castingTime, rank, power, effect, description) {
        this.name = name;
        this.fullName = fullName;
        this.icon = icon;
        this.mana = mana;
        this.castingTime = castingTime;
        this.rank = rank;
        this.power = power;
        this.effect = effect;
        this.description = description;
    }
}
class PlayerCasting {
    constructor(playerSpell, target) {
        this.spell = playerSpell;
        this.target = target;
        this.endTick = Math.ceil(this.spell.castingTime * 100 / (100 + playerStat.haste));
        this.tick = 0;
    }
    update() {
        if (this.target.life <= 0) {
            playerCastingBar = null;
            return;
        }
        this.tick++;
        if (this.tick <= this.endTick) {
            return;
        }
        playerCastingBar = null;
        playerStat.mana -= this.spell.mana;
        playerStat.lastCast = tickNumber;
        this.spell.effect(this.spell, this.target);
    }
    paint() {
        const left = CanvasWidth / 2 - 100;
        const top = 340;

        if (this.endTick <= 0)
            return;

        ctx.beginPath();
        ctx.lineWidth = "1";
        ctx.fillStyle = "blue";
        ctx.rect(left, top + 10, this.tick * 200 / this.endTick, 20);
        ctx.fill();

        ctx.beginPath();
        ctx.lineWidth = "1";
        ctx.strokeStyle = "gray";
        ctx.rect(left, top + 10, 200, 20);
        ctx.stroke();
    }
}
let playerCastingBar = null;

class SpellButton {
    constructor(playerSpell) {
        this.spell = playerSpell;
        this.icon = this.spell.icon;
        this.x = 0;
        this.y = 0;
        this.width = 48;
        this.height = 48;
        this.selected = false;
    }
    paint() {
        if (this.icon.paintScale) {
            ctx.beginPath();
            if (playerStat.mana < this.spell.mana) {
                ctx.fillStyle = "#f99";
            } else if (this.selected) {
                ctx.fillStyle = "#999";
            } else {
                ctx.fillStyle = "#ddd";
            }
            ctx.rect(this.x, this.y, this.width, this.height);
            ctx.fill();
            this.icon.paintScale(this.x, this.y, this.width, this.height);
        } else {
            ctx.drawImage(this.icon, this.x, this.y, this.width, this.height);
        }
        if (this.selected) {
            ctx.beginPath();
            ctx.lineWidth = "3";
            ctx.strokeStyle = "orange";
            ctx.rect(this.x, this.y, this.width, this.height);
            ctx.stroke();
        }
    }
    update() {
    }
    click(spellButtons) {
        this.selected = !this.selected;
        if (this.selected) {
            tooltip.current = new SpellTooltip(this.spell);
            for (let s of spellButtons) {
                if (s != this) {
                    s.selected = false;
                }
            }
        } else if (!this.selected) {
            playerCastingBar = null;
            tooltip.current = null;
        }
    }
    cast(target) {
        if (playerCastingBar != null) {
            return;
        }
        this.selected = false;
        if (this.spell.mana <= playerStat.mana && target.life > 0) {
            playerCastingBar = new PlayerCasting(this.spell, target);
        }
    }
}

const fastHeal1 = new PlayerSpell("Fast", "Fast heal", fastHealIcon, 100, 30, 1, 250, healCasted, "Heal any member of the teams");
const fastHeal2 = new PlayerSpell("Fast 2", "Fast heal II", fastHeal2Icon, 160, 30, 2, 400, healCasted, "Fast and big, but mana costly");
const slowHeal1 = new PlayerSpell("Slow", "Slow heal", slowHealIcon, 40, 90, 3, 250, healCasted, "Mana efficient, but slow to cast");
const slowHeal2 = new PlayerSpell("Slow 2", "Slow heal II", slowHeal2Icon, 60, 90, 4, 400, healCasted, "Big and efficient, but slow to cast");
const hotHeal = new PlayerSpell("HOT", "Heal over time", hotHealIcon, 80, 10, 5, 400 / 20, hotHealCaster, "Heal a little on every tick");
const aoeHeal = new PlayerSpell("AOE", "Heal all teams", aoeHealIcon, 120, 60, 6, 500, aoeHealCasted, "Share heal by all the teams");


function getPlayerSpellStats(spell) {
    let minHeal = Math.floor(spell.power * (100 + playerStat.healPower) / 100);
    let maxHeal = Math.floor(spell.power * (100 + playerStat.healPower + 10) / 100);
    let suffix = "";
    let crit = playerStat.crit;
    if (spell.name == "HOT") {
        crit = 0;
        suffix = " over 20 sec"
    }
    if (spell.name == "AOE") {
        minHeal = Math.floor(minHeal / teams.length);
        maxHeal = Math.floor(maxHeal / teams.length);
    }
    let castingTimeSec = Math.ceil(10 * spell.castingTime * 100 / (30 * (100 + playerStat.haste))) / 10;
    let mana = spell.mana;
    return { minHeal, maxHeal, suffix, crit, castingTimeSec, mana };
}
function trueHeal(power) {
    const poweredHeal = Math.floor(power * (100 + playerStat.healPower + Math.random() * 10) / 100);
    return poweredHeal;
}
function healCasted(stat, target) {
    const isCrit = Math.random() * 100 < playerStat.crit;
    target.onHeal(trueHeal(stat.power * (isCrit ? 3 : 1)), isCrit);
}
function hotHealCaster(stat, target) {
    target.pushBuff(new CharacterBuffEffect("Heal over time", target, stat.icon, 30, 30 * 20, stat, `Heal on each tick`, healCasted));
}
function aoeHealCasted(stat, target) {
    const heal = trueHeal(stat.power / teams.length);
    for (const c of teams) {
        c.onHeal(heal, false);
    }
}
class CharacterBuffEffect {
    constructor(name, character, icon, period, duration, stat, description, onTick) {
        this.name = name;
        this.character = character;
        this.icon = icon;
        this.period = period;
        this.start = tickNumber;
        this.duration = duration;
        this.onTick = onTick;
        this.stat = stat;
        this.description = description;
        this.isBonus = true;
    }
    update() {
        if (tickNumber == this.start) {
            return;
        }
        const ellapsed = tickNumber - this.start;
        if (ellapsed % this.period == 0) {
            this.onTick(this.stat, this.character);
        }
        if (ellapsed > this.duration) {
            return true;
        }
        return false;
    }
    paintScale(x, y, width, height) {
        if (this.icon.paintScale) {
            this.icon.paintScale(x, y, width, height);
        } else {
            ctx.drawImage(this.icon, x, y, width, height);
        }
    }
}
let playerSpells = [
    fastHeal1,
    hotHeal,
];
class PlayerStat {
    static left = 276;
    constructor() {
        this.maxMana = 800;
        this.mana = 800;
        this.lastCast = 0;
        this.manaRegen = 0;
        this.fullManaRegen = 20;
        this.liteManaRegen = 5;
        this.healPower = 0;
        this.haste = 0;
        this.crit = 0;
    }
    paint() {
        const width = 248;
        const top = 420;

        ctx.beginPath();
        ctx.lineWidth = "1";
        ctx.fillStyle = "blue";
        const manaPx = this.mana * width / this.maxMana;
        ctx.rect(PlayerStat.left, top + 10, manaPx, 20);
        ctx.fill();

        const selectedSpellButton = currentPage.spellButtons.find(s => s.selected);
        let selectedSpell = playerCastingBar ? playerCastingBar.spell : selectedSpellButton ? selectedSpellButton.spell : null;
        if (selectedSpell && selectedSpell.mana < this.mana) {
            const selectedWidth = selectedSpell.mana * width / this.maxMana;
            ctx.beginPath();
            ctx.lineWidth = "0";
            ctx.fillStyle = "#33f";
            ctx.rect(PlayerStat.left + manaPx - selectedWidth, top + 10, selectedWidth, 20);
            ctx.fill();
        }

        ctx.fillStyle = "green";
        ctx.font = "12px Arial";
        let label = "" + this.mana + " ( +" + this.manaRegen + ") / " + this.maxMana;
        ctx.fillText(label, PlayerStat.left + 80, top + 24);

        ctx.beginPath();
        ctx.lineWidth = "1";
        ctx.strokeStyle = "gray";
        ctx.rect(PlayerStat.left + 1, top + 10, width - 2, 20);
        ctx.stroke();
    }
    update() {
        const regenTick = tickNumber - this.lastCast;
        this.manaRegen = (regenTick > 2.5 * 30) ? this.fullManaRegen :
            (regenTick > 0.5 * 30) ? this.liteManaRegen : 0;
        if (regenTick % 30 == 0) {
            this.mana = Math.min(this.maxMana, this.mana + this.manaRegen);
        }
    }
}
let playerStat = new PlayerStat();
class CharacterMenu {
    constructor(character, i) {
        this.character = character;
        this.isLeft = !this.character.isVilain;
        this.x = this.isLeft ? 10 : 530;
        this.y = 20 + i * 60;
        this.height = 60;
        this.width = 200 + 40;
    }
    paint() {
        if (this.isLeft) {
            this.character.sprite.paint(this.x, this.y, 0);
            if (this.character.life <= 0) {
                deadSprite.paint(this.x + 4, this.y + 10);
            }
            this.paintLifeBar(this.x + 40, this.y);
        } else {
            this.character.sprite.paint(this.x + this.width - 36, this.y, 0, true);
            this.paintLifeBar(this.x, this.y);
        }
        for (let button of this.getBuffButtons()) {
            button.buff.paintScale(button.zone.x, button.zone.y, button.zone.width, button.zone.height);
        }
    }
    paintLifeBar(left, top) {
        ctx.beginPath();
        ctx.lineWidth = "1";
        ctx.fillStyle = this.character.isVilain ? "FireBrick" : "green";
        ctx.rect(left, top + 10, this.character.life * 200 / this.character.maxLife, 20);
        ctx.fill();

        let label = `${this.character.life} / ${this.character.maxLife}`
        if (this.character.life <= 0) {
            label = "Dead";
            ctx.beginPath();
            ctx.lineWidth = "1";
            ctx.fillStyle = "gray";
            ctx.rect(left, top + 10, 200, 20);
            ctx.fill();
        }

        ctx.fillStyle = "#FBC";
        ctx.font = "12px Arial";
        ctx.fillText(this.character.name, left + 5, top + 24);

        ctx.fillStyle = "black";
        ctx.font = "12px Arial";
        ctx.fillText(label, left + 90, top + 24);

        ctx.beginPath();
        ctx.lineWidth = "1";
        ctx.strokeStyle = "gray";
        ctx.rect(left, top + 10, 200, 20);
        ctx.stroke();
    }
    getBuffRect(i, isBonus) {
        const showLeft = this.isLeft == isBonus;
        const offsetX = this.isLeft ? 40 : 0
        const x = showLeft ?
            this.x + offsetX + i * 22
            : this.x + 200 - 22 - i * 22;
        const y = this.y + 32;
        return { x, y, width: 20, height: 20 };
    }
    getBuffButtons() {
        let buttons = [];
        const bonuses = this.character.buffs.filter(b => b.isBonus);
        const maluses = this.character.buffs.filter(b => !b.isBonus);
        for (let i = 0; i < bonuses.length; i++) {
            const zone = this.getBuffRect(i, true);
            buttons.push({ zone, buff: bonuses[i], isBonus: true });

        }
        for (let i = 0; i < maluses.length; i++) {
            const zone = this.getBuffRect(i, false);
            buttons.push({ zone, buff: maluses[i], isBonus: false });
        }
        return buttons;
    }
    getClickedBuff(event) {
        for (let button of this.getBuffButtons()) {
            if (isInside(button.zone, event)) {
                return button.buff;
            }
        }
        return null;
    }
}
class Tooltip {
    constructor() {
        this.current = null;
        this.isMinimized = false;
        this.x = CanvasWidth - 250;
        this.y = CanvasHeight - 150;
        this.width = 250;
        this.height = 150;
    }
    paint() {
        if (!this.current) {
            return;
        }
        ctx.beginPath();
        ctx.lineWidth = "1";
        ctx.fillStyle = "#303030";
        if (this.isMinimized) {
            ctx.rect(this.x + this.width - 40, this.y + this.height - 24, 40, 24);
        } else {
            ctx.rect(this.x, this.y, this.width, this.height);
        }
        ctx.fill();
        if (!this.isMinimized) {
            this.current.paint();
        }
    }
    click(event) {
        if (!this.current) {
            return;
        }
        if (!this.isMinimized && this.current.click && this.current.click(event)) {
            return;
        }
        this.isMinimized = !this.isMinimized;
    }
}
const tooltip = new Tooltip();
class CharacterTooltip {
    constructor(character) {
        this.character = character;
        this.buffY = tooltip.y + tooltip.height - 20 - 8;
        this.buffX = tooltip.x + 8 + 56;
    }
    paint() {
        let cursorY = tooltip.y + 22;
        let cursorX = tooltip.x + 8;

        ctx.fillStyle = this.character.isVilain ? "red" : "green";
        ctx.font = "bold 18px Verdana";
        ctx.fillText(this.character.name, cursorX, cursorY);
        cursorY += 18;

        ctx.fillStyle = "white";
        ctx.font = "12px Verdana";
        const lvl = this.character.isVilain ? currentLevel : this.character.level;
        ctx.fillText(`Level: ${lvl} - ${this.character.type}`, cursorX, cursorY);
        cursorY += 16;

        let dmg = this.character.spells[0].stat.dmg;
        let cooldown = Math.floor(0.34 * this.character.spells[0].stat.cooldown * (100 + this.character.slow) / (100 + this.character.haste)) / 10;
        let mainSpell = `Damage: ${dmg} every ${cooldown} seconds`;
        if (this.character.convertDeadIntoSkeletonChance > 0) {
            mainSpell = `Summon up to ${this.character.ultimatePower} skeletons`
        }
        ctx.fillText(mainSpell, cursorX, cursorY);
        cursorY += 16;
        if (this.character.convertDeadIntoSkeletonChance == 0) {
            ctx.fillText(`Crit chance: ${this.character.crit}%`, cursorX, cursorY);
        } else {
            ctx.fillText(`Collected: ${this.character.collectedBones} / 100 bones`, cursorX, cursorY);
        }
        cursorY += 16;

        let currentArmor = this.character.getArmor();
        let armorReduc = Math.floor(100 - Math.floor(100000 / (100 + currentArmor)) / 10);
        ctx.fillText(`Armor: ${currentArmor}. Reduce damage by ${armorReduc}%`, cursorX, cursorY);
        cursorY += 16;

        let dodgeText = `Dodge chance: ${this.character.dodge}%`;
        if (this.character.isBerserker) {
            const reduc = Math.floor(100 - 100 * 100 / (100 + this.character.berserkArmor));
            dodgeText = `Dodge:${this.character.dodge}%. Berserk dmg reduc:${reduc}%`;
        }
        ctx.fillText(dodgeText, cursorX, cursorY);
        cursorY += 16;
        if (this.character.buffs.length >= 1) {
            ctx.fillText(`Effects:`, tooltip.x + 8, this.buffY + 16);
        }
        for (let i = 0; i < this.character.buffs.length; i++) {
            const buffX = this.buffX + 24 * i;
            BuffTooltip.paintIcon(this.character.buffs[i], buffX, this.buffY);
        }
    }
    click(event) {
        for (let i = 0; i < this.character.buffs.length; i++) {
            const buffX = this.buffX + 24 * i;
            if (isInside({ x: buffX, y: this.buffY, width: 20, height: 20 }, event)) {
                tooltip.current = new BuffTooltip(this.character.buffs[i]);
                return true;
            }
        }
        return false;
    }
}
class SkeletonTooltip {
    constructor(skeleton) {
        this.skeleton = skeleton;
    }
    paint() {
        let cursorY = tooltip.y + 22;
        let cursorX = tooltip.x + 8;

        ctx.fillStyle = "darkgreen";
        ctx.font = "bold 18px Verdana";
        ctx.fillText(`Skeleton ${this.skeleton.id}/${this.skeleton.necro.ultimatePower}`, cursorX, cursorY);
        cursorY += 18;

        ctx.fillStyle = "white";
        ctx.font = "12px Verdana";
        ctx.fillText(`Summoned by ${this.skeleton.necro.name}`, cursorX, cursorY);
        cursorY += 16;

        let dmg = this.skeleton.damage;
        let cooldown = Math.floor(0.34 * this.skeleton.getCooldown()) / 10;
        ctx.fillText(`Damage: ${dmg} every ${cooldown} seconds`, cursorX, cursorY);
        cursorY += 16;

        ctx.fillText(`Crit chance: ${this.skeleton.necro.crit}%`, cursorX, cursorY);
        cursorY += 16;
    }
}
class BigBombTooltip {
    constructor(bomb) {
        this.bomb = bomb;
    }
    paint() {
        let cursorY = tooltip.y + 22;
        let cursorX = tooltip.x + 8;

        ctx.fillStyle = "orange";
        ctx.font = "bold 18px Verdana";
        ctx.fillText(`Look like a bomb`, cursorX, cursorY);
        cursorY += 18;

        ctx.fillStyle = "white";
        ctx.font = "12px Verdana";
        ctx.fillText(`Damage: 3141592653589793238462`, cursorX, cursorY);
        cursorY += 16;
        cursorY += 16;
        ctx.fillText(`You should probably clean this level`, cursorX, cursorY);
        cursorY += 16;
        ctx.fillText(`as fast as you can!`, cursorX, cursorY);
        cursorY += 16;

    }
    click(event) {
        return false;
    }
}
class BuffTooltip {
    constructor(buff) {
        this.buff = buff;
    }
    static paintIcon(buff, buffX, buffY) {
        ctx.beginPath();
        ctx.lineWidth = "1";
        ctx.fillStyle = "#fff6";
        ctx.rect(buffX, buffY, 22, 22);
        ctx.fill();
        buff.icon.paintScale(buffX, buffY, 20, 20);
    }
    paint() {

        BuffTooltip.paintIcon(this.buff, tooltip.x + 4, tooltip.y + 4);

        let cursorY = tooltip.y + 22;
        let cursorX = tooltip.x + 8;

        ctx.fillStyle = "yellow";
        ctx.font = "bold 18px Verdana";
        ctx.fillText(this.buff.name, cursorX + 24, cursorY);
        cursorY += 18;

        ctx.fillStyle = "white";
        ctx.font = "12px Verdana";
        ctx.fillText(`${this.buff.description}`, cursorX, cursorY);
        cursorY += 16;
    }
}
class SpellTooltip {
    constructor(spell) {
        this.spell = spell;
        this.spellStats = getPlayerSpellStats(spell);
    }
    paint() {
        let cursorY = tooltip.y + 22;
        let cursorX = tooltip.x + 8;

        ctx.fillStyle = "green";
        ctx.font = "bold 18px Verdana";
        ctx.fillText(this.spell.fullName, cursorX, cursorY);
        cursorY += 18;

        ctx.fillStyle = "white";
        ctx.font = "12px Verdana";
        ctx.fillText(`${this.spell.description}`, cursorX, cursorY);
        cursorY += 16;
        ctx.fillText(`Heal: ${this.spellStats.minHeal} - ${this.spellStats.maxHeal} ${this.spellStats.suffix}`, cursorX, cursorY);
        cursorY += 16;
        ctx.fillText(`Mana: ${this.spellStats.mana}`, cursorX, cursorY);
        cursorY += 16;
        ctx.fillText(`Casting: ${this.spellStats.castingTimeSec} sec`, cursorX, cursorY);
        cursorY += 16;
        ctx.fillText(`Crit chance: ${this.spellStats.crit}%`, cursorX, cursorY);
    }
}
let isPaused = false;
class Board {
    constructor() {
        allAnimations = [];
        characterMenus = [];
        tooltip.current = null;
        playerCastingBar = null;
        for (let i = 0; i < teams.length; i++) {
            characterMenus.push(new CharacterMenu(teams[i], i));
            teams[i].life = teams[i].maxLife;
            teams[i].buffs = [];
        }
        const vilain = vilainsFactory.createVilainOfLevel(currentLevel);
        mobs = [vilain];
        characterMenus.push(new CharacterMenu(vilain, 0));
        this.placeCharacters();
        for (let anim of vilain.animationsToStartOnInit) {
            allAnimations.push(anim);
        }
        this.combatEnded = null;
        playerStat.haste = teams[0].haste;
        playerStat.crit = teams[0].crit;
        playerStat.mana = playerStat.maxMana;
        playerSpells.sort((a, b) => a.rank - b.rank)
        this.spellButtons = [];
        for (let i = 0; i < playerSpells.length; i++) {
            const button = new SpellButton(playerSpells[i]);
            button.x = PlayerStat.left + i * (button.width + 2);
            button.y = CanvasHeight - button.height - 20;
            this.spellButtons.push(button)
        }
        this.pauseButton = { x: CanvasWidth - 28, y: 10, width: 20, height: 20, tick: 0 };
    }

    placeCharacters() {
        const vilain = mobs[0];
        vilain.x = 620;
        vilain.y = 180;
        const tank = teams.find(c => c.isTank) ?? teams[teams.length - 1];
        tank.x = 560;
        tank.y = 170;
        const rangeds = teams.filter(c => c != tank);
        for (let i = 0; i < rangeds.length; i++) {
            rangeds[i].x = 450 - Math.floor(i / 3) * 100;
            rangeds[i].y = 100 + (i % 3) * 100;
        }
    }

    paint() {
        this.paintPauseButton();
        if (tooltip)
            tooltip.paint();
        for (const c of teams) {
            c.paint();
        }
        for (const c of mobs) {
            c.paint();
        }
        for (let m of characterMenus) {
            m.paint();
        }
        for (const s of this.spellButtons) {
            s.paint();
        }
        for (const a of allAnimations) {
            a.paint();
        }
        if (playerCastingBar)
            playerCastingBar.paint();
        playerStat.paint();
        if (this.combatEnded != null) {
            if (teams[0].life <= 0) {
                ctx.fillStyle = "darkred";
                ctx.font = "24px Verdana";
                ctx.fillText("Pelin is dead", 500, 200);
            } else {
                ctx.fillStyle = "darkgreen";
                ctx.font = "24px Verdana";
                ctx.fillText("Victory!", 500, 200);
            }
        }
    }
    paintPauseButton() {
        ctx.fillStyle = "silver";
        ctx.fillRect(this.pauseButton.x, this.pauseButton.y, this.pauseButton.width, this.pauseButton.height);
        ctx.fillStyle = (!isPaused || (++this.pauseButton.tick % 25) < 15) ? "black" : "silver";
        ctx.font = "14px Verdana";
        ctx.fillText(isPaused ? ">" : "||", this.pauseButton.x + 4, this.pauseButton.y + 14);
    }
    update() {
        for (let i = 0; i < allAnimations.length; i++) {
            if (allAnimations[i].update()) {
                allAnimations.splice(i--, 1);
            }
        }
        for (const c of teams) {
            c.update();
        }
        for (const c of mobs) {
            c.update();
        }
        for (const s of this.spellButtons) {
            s.update();
        }
        if (playerCastingBar)
            playerCastingBar.update();
        playerStat.update();
        if (this.combatEnded == null) {
            if (teams[0].life <= 0 || mobs.filter(c => c.life > 0).length == 0) {
                this.combatEnded = mobs[0].maxLife == 10 ? 1 : 80;
            }
        }
        else if (this.combatEnded <= 0) {
            if (teams[0].life <= 0) {
                currentPage = new DeadScreen();
            } else {

                if (vilainsFactory.isLastLevel(currentLevel)) {
                    currentPage = new EndGameScreen();
                } else {
                    this.onLevelCleared();

                }
            }
        } else {
            this.combatEnded--;
        }
    }
    onLevelCleared() {
        const deadCount = teams.filter(c => c.life <= 0).length + 1;
        const necros = teams.filter(c => c.life > 0 && c.convertDeadIntoSkeletonChance > 0);
        let newSkeletons = 0;
        for (let i = 0; i < deadCount; i++) {
            for (let necro of necros) {
                let collected = getRandomInt(necro.convertDeadIntoSkeletonChance, necro.convertDeadIntoSkeletonChance + 40);
                if (i != 0) {
                    collected *= 3;
                }
                necro.collectedBones += collected;
                while (necro.collectedBones >= 100) {
                    necro.collectedBones -= 100;
                    necro.ultimatePower++;
                    newSkeletons++;
                }
            }
        }
        teams = teams.filter(c => c.life > 0);
        if (currentLevel % 3 == 0 && rerollsNumber < 3) {
            rerollsNumber++;
        }
        if (newSkeletons > 0) {
            currentPage = new NecroLevelScreen(newSkeletons);
        } else {
            currentPage = new EndLevelStatScreen();
        }
    }
    click(event) {
        if (isInside(this.pauseButton, event)) {
            isPaused = !isPaused;
            return true;
        }
        for (const s of this.spellButtons) {
            if (isInside(s, event)) {
                s.click(this.spellButtons);
                return true;
            }
        }
        let selectedChar = null;
        let selectedBuff = null;
        for (let m of characterMenus) {
            if (isInside(m, event) || isInside(m.character, event)) {
                selectedChar = m.character;
                selectedBuff = m.getClickedBuff(event);
            }
        }
        if (isInside(tooltip, event)) {
            tooltip.click(event);
            return true;
        }
        if (selectedChar != null) {
            let spell = this.spellButtons.find(s => s.selected);
            if (spell) {
                spell.cast(selectedChar);
            } else {
                if (selectedBuff) {
                    tooltip.current = new BuffTooltip(selectedBuff);
                } else {
                    tooltip.current = new CharacterTooltip(selectedChar);
                }
                tooltip.isMinimized = false;
            }
            return true;
        }
        for (let anim of allAnimations.filter(a => a.click)) {
            if (anim.click(event)) {
                return true;
            }
        }
        tooltip.current = null;
        return false;
    }
    digitKeyPressed(value) {
        if (value >= this.spellButtons.length) {
            return;
        }
        const spell = this.spellButtons[value];
        spell.click(this.spellButtons);
    }
}
class MenuButton {
    constructor(x, y, label, click) {
        this.x = x;
        this.y = y;
        this.label = label;
        this.click = click;
        this.width = 200;
        this.height = 44;
        this.mouseOver = false;
        this.textX = null;
    }
    paint() {
        ctx.fillStyle = this.mouseOver ? "silver" : "gray";
        ctx.fillRect(this.x, this.y, this.width, this.height);

        ctx.fillStyle = "black";
        ctx.font = "32px Verdana";
        if (this.textX == null) {
            const textWidth = ctx.measureText(this.label).width;
            this.textX = this.x + this.width / 2 - textWidth / 2;
        }
        ctx.fillText(this.label, this.textX, this.y + 33);
    }
    mouseEnter() {
        this.mouseOver = true;
    }
    mouseExit() {
        this.mouseOver = false;
    }
}
class StartMenu {
    constructor() {
        this.buttons = [new MenuButton(500, 350, "Start", () => this.startGame())]
    }
    update() { }
    paint() {
        ctx.fillStyle = "black";
        ctx.font = "24px Verdana";
        ctx.fillText("You are Pelin:", 100, 100);
        healerSprite.paint(280, 60)
        ctx.fillText("Your power is to heal.", 100, 150);
        ctx.fillText("Descent to the dungeon, gather a group and", 100, 200);
        ctx.fillText("increase your stats to clean the dungeon.", 100, 230);
        ctx.fillText("Pelin shall not die. There is no resurection for no one.", 100, 280);
        for (let b of this.buttons) {
            b.paint();
        }
    }
    startGame() {
        currentLevel = 1;
        rerollsNumber = 2;
        heroesFactory = new Heroes();
        teams = [heroesFactory.createPelin()];
        playerSpells = [
            fastHeal1,
            hotHeal,
        ];
        currentPage = new Board();
    }
}
class NecroLevelScreen {
    constructor(newSkeletons) {
        this.newSkeletons = newSkeletons;
        this.buttons = [new MenuButton(500, 350, "Ok", () => this.nextPage())]
    }
    update() { }
    paint() {
        ctx.fillStyle = "black";
        ctx.font = "24px Verdana";
        const text = this.newSkeletons == 1 ?
            `A new skeleton has join your Necro` :
            `Your Necro have ${this.newSkeletons} new skeletons`;
        ctx.fillText(text, 100, 100);
        for (let b of this.buttons) {
            b.paint();
        }
    }
    nextPage() {
        currentPage = new EndLevelStatScreen();
    }
}
class EndLevelStatScreen {
    constructor() {                
        if(!vilainsFactory.isLastLevel(currentLevel)){
            this.nextBoss = vilainsFactory.createVilainOfLevel(currentLevel + 1);
        }
        let buttonY = 350;
        if(this.nextBoss && this.nextBoss.spells.length >= 5){
            buttonY = 380;
        }
        this.buttons = [new MenuButton(500, buttonY, "Next", () => this.nextPage())];
    }
    update() { }
    paint() {
        this.paintDamages();
        this.paintNextBoss(this.nextBoss);
        for (let b of this.buttons) {
            b.paint();
        }
    }
    paintDamages() {
        const baseX = 60;
        ctx.fillStyle = "black";
        ctx.font = "20px Verdana";
        ctx.fillText('Damages', baseX + 30, 36);

        let totalDmgDone = 0;
        for (let pnj of teams) {
            totalDmgDone += pnj.damageDone;
        }
        if (totalDmgDone == 0) {
            totalDmgDone = 1;
        }
        for (let i = 0; i < teams.length; i++) {
            const pnj = teams[i];

            const baseY = 48 + 50 * i;
            pnj.sprite.paint(baseX, baseY, 0);
            if (pnj.life <= 0) {
                deadSprite.paint(baseX + 4, baseY + 10);
            }
            const cursorX = baseX + 40;
            let cursorY = baseY + 20;
            ctx.fillStyle = "black";
            ctx.font = "12px Verdana";
            ctx.fillText(`Done: ${pnj.damageDone}, Team: ${Math.floor(100 * pnj.damageDone / totalDmgDone)}%`, cursorX, cursorY);

            cursorY += 20;
            let mitigation = pnj.damageNotMitagedTaken != 0 ?
                Math.floor(100 * (pnj.damageNotMitagedTaken - pnj.damageTaken) / pnj.damageNotMitagedTaken)
                : 0;
            ctx.fillText(`Taken: ${pnj.damageNotMitagedTaken}, Mitigation: ${mitigation}%`, cursorX, cursorY);

        }
    }
    paintNextBoss(boss) {
        if (!boss) {
            return;
        }
        const cursorX = 410;
        let cursorY = 36;
        ctx.fillStyle = "black";
        ctx.font = "20px Verdana";
        ctx.fillText('Next boss', cursorX + 30, cursorY);

        cursorY += 40;
        boss.sprite.paint(cursorX + 16 - boss.sprite.singleWidth * 0.5, cursorY + 24 - boss.sprite.tHeight, 0);
        ctx.fillStyle = "maroon";
        ctx.font = "bold 18px Verdana";
        ctx.fillText(boss.name, cursorX + 40, cursorY);
        cursorY += 20;
        ctx.fillStyle = "black";
        ctx.font = "12px Verdana";
        ctx.fillText(`Level ${boss.level}`, cursorX + 40, cursorY);

        cursorY += 24;
        let dmg = boss.spells[0].stat.dmg;
        let cooldown = Math.floor(0.34 * boss.spells[0].stat.cooldown) / 10;
        let mainSpell = `Damage: ${dmg} every ${cooldown} seconds`;
        ctx.fillText(mainSpell, cursorX, cursorY);

        cursorY += 20;
        let currentArmor = boss.getArmor();
        let armorReduc = Math.floor(100 - Math.floor(100000 / (100 + currentArmor)) / 10);
        ctx.fillText(`Armor: ${currentArmor}. Reduce damage by ${armorReduc}%`, cursorX, cursorY);
        cursorY += 10;
        let descriptions = boss.spells.filter(s => s.getDescription).map(s => s.getDescription());
        for (let otherEffect of boss.animationsToStartOnInit.filter(a => a.getDescription)) {
            descriptions.push(otherEffect.getDescription());
        }
        for (let desc of descriptions) {
            desc.icon.paintScale(cursorX, cursorY, 32, 32);
            ctx.fillStyle = "black";
            ctx.font = "bold 14px Verdana";
            let yIncr = 8;
            ctx.fillText(desc.title, cursorX + 40, cursorY + yIncr);
            yIncr += 14;
            for (let i = 0; i < desc.desc.length; i++) {
                ctx.font = "12px Verdana";
                ctx.fillStyle = "#444";
                ctx.fillText(desc.desc[i], cursorX + 40, cursorY + yIncr);
                yIncr += 12;
            }          
            cursorY += Math.max(40, yIncr);
        }
    }
    nextPage() {
        currentPage = new SelectUpgradeScreen(1);
    }
}
class SelectUpgradeScreen {
    constructor(step) {
        this.step = step;
        if (this.step == 1 && currentLevel % 3 != 0) {
            this.step = 2;
        }
        if (this.step == 1) {
            this.upgrades = upgradeFactory.propose3UpgradesForPelin();
            if (this.upgrades.length == 0) {
                this.step = 2;
            }
        }
        if (this.step == 2) {
            this.upgrades = upgradeFactory.propose3Upgrades();
        }
        this.buttons = []
        for (let i = 0; i < this.upgrades.length; i++) {
            this.buttons.push(new MenuButton(50 + i * 250, 350, this.upgrades[i].verb, () => this.selectUpgrade(i)))
        }
        if (rerollsNumber > 0) {
            this.buttons.push(new MenuButton(CanvasWidth - 210, 10, `Reroll (${rerollsNumber})`, () => this.reroll()))
        }
    }
    update() { }
    paint() {
        ctx.fillStyle = "black";
        ctx.font = "30px Verdana";
        if (this.step == 1) {
            ctx.fillText("Select an upgrade for Pelin", 40, 40);
        } else if (this.step == 2) {
            ctx.fillText("Improve your team", 40, 40);
        } else {
            ctx.fillText("Select a level up bonus", 40, 40);
        }
        for (let i = 0; i < this.upgrades.length; i++) {
            const upgrade = this.upgrades[i];
            upgrade.sprite.paint(50 + i * 250, 100);
            ctx.fillStyle = "black";
            ctx.font = "16px Verdana";
            const cursorX = 50 + i * 250;
            const cursorY = 180;

            for (let line = 0; line < upgrade.desc.length; line++) {
                ctx.fillText(upgrade.desc[line], cursorX, cursorY + line * 24 + (line != 0 ? 20 : 0));
            }

        }
        for (let b of this.buttons) {
            b.paint();
        }
        for (let i = 0; i < this.upgrades.length; i++) {
            const upgrade = this.upgrades[i];
            if (upgrade.verbIcon) {
                upgrade.verbIcon.paintScale(50 + i * 250, 350 + 4, 32, 32);
                upgrade.verbIcon.paintScale(50 + 2 + i * 250 + 164, 350 + 4, 32, 32);
            }
        }
    }
    selectUpgrade(index) {
        const upgrade = this.upgrades[index];
        upgradeFactory.click(upgrade);
        if (this.step == 1) {
            currentPage = new SelectUpgradeScreen(this.step + 1);
        } else {
            currentLevel++;
            currentPage = new Board();
        }
    }
    reroll() {
        rerollsNumber--;
        currentPage = new SelectUpgradeScreen(this.step);
    }
}
class DeadScreen {
    constructor() {
        this.buttons = [new MenuButton(500, 350, "Ok", () => this.goToMainMenu())]
    }
    update() { }
    paint() {
        ctx.fillStyle = "black";
        ctx.font = "24px Verdana";
        ctx.fillText("You are dead", 100, 100);
        if (currentLevel > 1) {
            ctx.fillStyle = "gray";
            ctx.font = "16px Verdana";
            ctx.fillText(`You reached the level ${currentLevel} / ${vilainsFactory.levelCount()}`, 100, 180);
        }
        for (let b of this.buttons) {
            b.paint();
        }
    }
    goToMainMenu() {
        currentPage = new StartMenu();
    }
}
class EndGameScreen {
    constructor() {
        this.buttons = []
    }
    update() { }
    paint() {
        ctx.fillStyle = "black";
        ctx.font = "24px Verdana";
        ctx.fillText("You have clean the dungeon!", 100, 100);
        ctx.fillText("Now the world is at peace.", 100, 140);
    }
}

let currentPage = new StartMenu();
// Debug mode:
if (window.location.search) {
    const params = new URLSearchParams(window.location.search);
    const lvl = params.get("lvl");
    if (lvl) {
        currentLevel = parseInt(lvl) - 1;
        const knight = heroesFactory.createKnight();
        //  knight.level = 5;
        const witch = heroesFactory.createWitch();
        witch.crit = 20;
        const necro = heroesFactory.createNecro();
        necro.ultimatePower = 5;
        teams = [
            heroesFactory.createPelin(),
            knight,
            witch,
            heroesFactory.createHunter(),
            heroesFactory.createBerserker(),
            necro,
            heroesFactory.createBerserker(),
        ];
        //  teams[1].armor = 100;
        // teams[1].crit = 50;
        //teams[2].spells[0].stat.dmg = 100000;    
        //   teams[teams.length - 1].ultimatePower = 3;

        playerSpells = [aoeHeal, fastHeal1, slowHeal1, hotHeal]
        //currentPage = new SelectUpgradeScreen(1);
        necro.damageDone = 300;
        witch.damageDone = 3000;
        witch.damageTaken = 4000;
        witch.damageNotMitagedTaken = 5000;
        currentPage = new EndLevelStatScreen();
    }
}
const tickDuration = 1000.0 / 30;
function tick() {
    if (!isPaused) {
        tickNumber++;
        update();
    }
    paint();
    setTimeout(tick, tickDuration);
}
function update() {
    currentPage.update();
}
function paint() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    currentPage.paint();
}
function isInside(control, event) {
    if (!control) {
        return false;
    }
    return event.offsetX >= control.x && event.offsetX < control.x + control.width
        && event.offsetY >= control.y && event.offsetY < control.y + control.height
}
function onmousedown(event) {
    if (currentPage.click) {
        currentPage.click(event);
    }
    if (currentPage.buttons) {
        for (const c of currentPage.buttons) {
            if (isInside(c, event)) {
                c.click(event);
            }
        }
    }
}

let currentControl = null;
function onmousemove(event) {
    if (!currentPage.buttons)
        return;
    let newControl = null
    for (const c of currentPage.buttons) {
        if (isInside(c, event)) {
            newControl = c;
            break;
        }
    }
    if (currentControl === newControl) {
        return;
    }
    if (currentControl && currentControl.mouseExit)
        currentControl.mouseExit(event);
    if (newControl && newControl.mouseEnter)
        newControl.mouseEnter(event);
    currentControl = newControl;
}
function handleKeyPress(event) {
    if (event.keyCode == 32) {
        isPaused = !isPaused;
    }
    if (currentPage != null && currentPage.digitKeyPressed) {
        switch (event.code) {
            case 'Digit1': currentPage.digitKeyPressed(0); break;
            case 'Digit2': currentPage.digitKeyPressed(1); break;
            case 'Digit3': currentPage.digitKeyPressed(2); break;
            case 'Digit4': currentPage.digitKeyPressed(3); break;
            case 'Digit5': currentPage.digitKeyPressed(4); break;
        }
    }
    //console.log(event.code)
}
tick();