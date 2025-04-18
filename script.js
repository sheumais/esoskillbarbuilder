let draggedImageSrc = null;
let sourceSlot = null;
let dropSucceeded = false;
let skillID = 0;
const skillTable = {};

function generateShareableURL() {
    const slotSetup = [];
    document.querySelectorAll('.slot').forEach(slot => {

        if (slot && slot.dataset.skillID) {
            slotSetup.push(slot.dataset.skillID);
        } else {
            slotSetup.push('');
        }
    });
    const url = new URL(window.location.href);
    url.searchParams.set("skills", "LIST_OF_IDS_PLACEHOLDER");
    const newUrlString = url.toString().replace("LIST_OF_IDS_PLACEHOLDER", slotSetup.join(','));
    history.pushState({}, '', newUrlString);
}

function loadSetupFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const idsParam = urlParams.get('skills');

    if (!idsParam) return;

    const skillIDs = idsParam.split(',');

    document.querySelectorAll('.slot').forEach((slot, index) => {
        const skillID = skillIDs[index];

        if (skillID && skillTable[skillID]) {
            const skill = skillTable[skillID];

            const img = document.createElement('img');
            img.src = `icons/${skill.fileName}`;
            img.alt = skill.skillName;
            img.title = skill.skillName;
            img.setAttribute('draggable', 'true');
            img.dataset.skillInfo = `${skill.skillClass}:${skill.skillTree}`;
            img.dataset.skillId = skillID;

            img.addEventListener('dragstart', () => {
                draggedImageSrc = img.getAttribute('src');
                sourceSlot = null;
                dropSucceeded = false;
            });

            slot.innerHTML = '';
            slot.appendChild(img);
            slot.dataset.skillInfo = `${skill.skillClass}:${skill.skillTree}`;
            slot.dataset.skillID = skillID;
        } else {
            slot.innerHTML = '';
            delete slot.dataset.skillInfo;
            delete slot.dataset.skillID;
        }
    });

    updateUsedSkillLines();
}

function updateResetButtonVisibility() {
    const hasSkills = Array.from(document.querySelectorAll('.slot')).some(slot => slot.dataset.skillID);
    const resetButton = document.getElementById('reset');

    if (hasSkills) {
        resetButton.classList.add('visible');
    } else {
        resetButton.classList.remove('visible');
    }
}

function resetSkillSlots() {
    document.querySelectorAll('.slot').forEach(slot => {
        slot.innerHTML = '';
        delete slot.dataset.skillInfo;
        delete slot.dataset.skillID;
    });
    updateUsedSkillLines();
    updateResetButtonVisibility();
    let resetRotation = 360;
    const resetButton = document.getElementById('reset');
    resetButton.style.setProperty('--base-rotation', `${resetRotation}deg`);
    resetButton.style.transform = `rotate(${resetRotation}deg)`;
    setTimeout(() => {
        const stillVisible = resetButton.classList.contains('visible');
        if (!stillVisible) {
            resetRotation = 0;
            resetButton.removeAttribute('style');
        }
    }, 400);
}

function allowDrop(event) {
    event.preventDefault();
}

function updateUsedSkillLines() {
    generateShareableURL()
    updateResetButtonVisibility();
    const slots = document.querySelectorAll('.slot');
    const usedClassSkillLines = new Set();

    slots.forEach(slot => {
        const info = slot.dataset.skillInfo;
        if (info) {
            const [skillClass, skillTree] = info.split(':');
            if (['Arcanist', 'Nightblade', 'Templar', 'Dragonknight', 'Sorcerer', 'Warden', 'Necromancer'].includes(skillClass)) {
                usedClassSkillLines.add(`${skillClass}:${skillTree}`);
            }
        }
    });

    if (usedClassSkillLines.size >= 3) {
        hideUnusedClassSkillLines(usedClassSkillLines);
    } else {
        showAllClassSkillLines();
    }
}



document.querySelectorAll('.skill').forEach(skill => {
    skill.addEventListener('dragstart', () => {
        draggedImageSrc = skill.getAttribute('src');
        sourceSlot = null;
        dropSucceeded = false;
    });
});

document.querySelectorAll('.slot').forEach(slot => {
    slot.addEventListener('dragstart', () => {
        const img = slot.querySelector('img');
        if (img) {
            draggedImageSrc = img.getAttribute('src');
            sourceSlot = slot;
            dropSucceeded = false;
        }
    });

    slot.addEventListener('dragover', (e) => {
        e.preventDefault();
        slot.classList.add('drag-over');
    });

    slot.addEventListener('dragleave', () => {
        slot.classList.remove('drag-over');
    });


    function setDataAttributeOrRemove(el, key, value) {
        if (value !== undefined && value !== '') {
            el.dataset[key] = value;
        } else {
            delete el.dataset[key];
        }
    }
    
    slot.addEventListener('drop', (e) => {
        e.preventDefault();
        dropSucceeded = true;
        slot.classList.remove('drag-over');

        let skillElement;

        if (sourceSlot && sourceSlot !== slot) {
            const temp = slot.innerHTML;
            slot.innerHTML = sourceSlot.innerHTML;
            sourceSlot.innerHTML = temp;

            const sourceData = sourceSlot.dataset.skillInfo;
            const sourceDataID = sourceSlot.dataset.skillID;
            const targetData = slot.dataset.skillInfo;
            const targetDataID = slot.dataset.skillID;
            setDataAttributeOrRemove(sourceSlot, 'skillInfo', targetData);
            setDataAttributeOrRemove(sourceSlot, 'skillID', targetDataID);
            setDataAttributeOrRemove(slot, 'skillInfo', sourceData);
            setDataAttributeOrRemove(slot, 'skillID', sourceDataID);

        } else if (sourceSlot === slot) {
            // do nothing
        } else if (draggedImageSrc) {
            skillElement = document.querySelector(`img[src="${draggedImageSrc}"]`);
            const skillInfo = skillElement?.dataset?.skillInfo || '';
            const skillIDInfo = skillElement?.dataset?.skillID || '';
            slot.innerHTML = '';
            const newImg = document.createElement('img');
            newImg.src = draggedImageSrc;
            newImg.alt = skillElement?.alt || '';
            newImg.title = skillElement?.title || '';
            newImg.setAttribute('draggable', 'true');
            newImg.dataset.skillInfo = skillInfo;
            newImg.dataset.skillID = skillIDInfo;
            newImg.addEventListener('dragstart', () => {
                draggedImageSrc = newImg.getAttribute('src');
                sourceSlot = null;
                dropSucceeded = false;
            });
            slot.appendChild(newImg);
            slot.dataset.skillInfo = skillInfo;
            slot.dataset.skillID = skillIDInfo;
        }

        draggedImageSrc = null;
        sourceSlot = null;

        updateUsedSkillLines();
    });


    slot.addEventListener('dragend', () => {
        if (!dropSucceeded && sourceSlot) {
            sourceSlot.innerHTML = '';
            delete sourceSlot.dataset.skillInfo;
            delete sourceSlot.dataset.skillID;
        }

        draggedImageSrc = null;
        sourceSlot = null;
        dropSucceeded = false;

        updateUsedSkillLines();
    });
});

function hideUnusedClassSkillLines(usedSkillLines) {
    document.querySelectorAll('.skill-icon-row').forEach(container => {
        const skillLine = container.dataset.skillLine;
        if (!skillLine) return;

        const [skillClass] = skillLine.split(':');
        const isClassSkill = ['Arcanist', 'Nightblade', 'Templar', 'Dragonknight', 'Sorcerer', 'Warden', 'Necromancer'].includes(skillClass);

        if (isClassSkill) {
            if (!usedSkillLines.has(skillLine)) {
                container.style.display = 'none';
                const label = container.previousElementSibling;
                if (label?.classList.contains('skill-subsubgroup-label')) {
                    label.style.display = 'none';
                }
            } else {
                container.style.display = '';
                const label = container.previousElementSibling;
                if (label?.classList.contains('skill-subsubgroup-label')) {
                    label.style.display = '';
                }
            }
        }
    });
}

function showAllClassSkillLines() {
    document.querySelectorAll('.skill-icon-row').forEach(container => {
        const skillLine = container.dataset.skillLine;
        if (!skillLine) return;

        const [skillClass] = skillLine.split(':');
        const isClassSkill = ['Arcanist', 'Nightblade', 'Templar', 'Dragonknight', 'Sorcerer', 'Warden', 'Necromancer'].includes(skillClass);

        if (isClassSkill) {
            container.style.display = '';
            const label = container.previousElementSibling;
            if (label?.classList.contains('skill-subsubgroup-label')) {
                label.style.display = '';
            }
        }
    });
}

function setRandomFavicon() {
    const skillIds = Object.keys(skillTable);
    const randomSkillID = skillIds[Math.floor(Math.random() * skillIds.length)];
    const randomSkill = skillTable[randomSkillID];

    let favicon = document.querySelector("link[rel='icon']");
    if (!favicon) {
        favicon = document.createElement("link");
        favicon.rel = "icon";
        document.head.appendChild(favicon);
    }
    favicon.href = `icons/${randomSkill.fileName}`;
}

fetch('skills.json')
    .then(response => response.json())
    .then(skillData => {
        const skillPool = document.querySelector('.skill-pool');
        const mainCategoryOrder = ['Class', 'Non Class'];
        const classOrder = [
            'Arcanist', 'Nightblade', 'Templar', 'Dragonknight', 'Sorcerer', 'Warden', 'Necromancer', 'Weapon', 'Armor', 'World', 'Guild', 'Alliance War'
        ];
        const nestedGroups = {};
        Object.entries(skillData).forEach(([fileName, data]) => {
            const mainCat = data.mainCategory;
            const skillClass = data.class;
            const skillTree = data.skillTree;

            if (!nestedGroups[mainCat]) nestedGroups[mainCat] = {};
            if (!nestedGroups[mainCat][skillClass]) nestedGroups[mainCat][skillClass] = {};
            if (!nestedGroups[mainCat][skillClass][skillTree]) nestedGroups[mainCat][skillClass][skillTree] = [];

            nestedGroups[mainCat][skillClass][skillTree].push({
                fileName,
                ...data
            });
        });

        mainCategoryOrder.forEach(mainCat => {
            if (!nestedGroups[mainCat]) return;
            classOrder.forEach(skillClass => {
                const skillTrees = nestedGroups[mainCat][skillClass];
                if (!skillTrees) return;

                if (skillClass === 'Armor') {
                    const treeLabel = document.createElement('div');
                    treeLabel.classList.add('skill-subsubgroup-label');
                    treeLabel.textContent = 'Armour';
                    skillPool.appendChild(treeLabel);

                    const iconContainer = document.createElement('div');
                    iconContainer.classList.add('skill-icon-row');
                    iconContainer.dataset.skillLine = 'Armor';
                    skillPool.appendChild(iconContainer);

                    const allArmorSkills = Object.values(skillTrees).flat();
                    allArmorSkills.sort((a, b) => a.position - b.position);

                    allArmorSkills.forEach(({
                        fileName,
                        skillName
                    }) => {
                        const img = document.createElement('img');
                        img.src = `icons/${fileName}`;
                        img.alt = skillName;
                        img.title = skillName;
                        img.classList.add('skill');
                        img.dataset.skillInfo = `Armor`;
                        img.dataset.skillID = skillID;
                        img.setAttribute('draggable', 'true');
                        skillTable[skillID] = {
                            fileName,
                            skillName,
                            skillClass,
                            skillTree: 'Armor'
                        };

                        img.addEventListener('dragstart', () => {
                            draggedImageSrc = img.getAttribute('src');
                            sourceSlot = null;
                            dropSucceeded = false;
                        });

                        iconContainer.appendChild(img);
                        skillID++;
                    });
                } else {
                    Object.entries(skillTrees).forEach(([skillTree, skills]) => {
                        const treeLabel = document.createElement('div');
                        treeLabel.classList.add('skill-subsubgroup-label');
                        
                        const labelWrapper = document.createElement('div');
                        labelWrapper.classList.add('skill-line-label-wrapper');
                        labelWrapper.appendChild(document.createTextNode(skillTree));
                        
                        if (mainCat == "Class") {
                            const icon = document.createElement('img');
                            const iconFileName = `gp_class_${skillClass.toLowerCase()}.png`;
                            icon.src = `icons/${iconFileName}`;
                            icon.classList.add('skill-line-icon');
                            labelWrapper.appendChild(icon);
                            const link = document.createElement('a');
                            const formattedClass = skillClass.toLowerCase();
                            const formattedTree = skillTree.toLowerCase().replace(/\s+/g, '-').replace(/'/g, '');
                            link.href = `https://eso-hub.com/en/skills/${formattedClass}/${formattedTree}`;
                            link.target = '_blank';
                            link.classList.add('skill-line-link');
                            link.appendChild(labelWrapper);
                            treeLabel.appendChild(link);
                        } else {
                            treeLabel.appendChild(labelWrapper);
                        }
                        
                        skillPool.appendChild(treeLabel);

                        const iconContainer = document.createElement('div');
                        iconContainer.classList.add('skill-icon-row');
                        iconContainer.dataset.skillLine = `${skillClass}:${skillTree}`;
                        skillPool.appendChild(iconContainer);

                        skills.sort((a, b) => a.position - b.position);
                        skills.forEach(({
                            fileName,
                            skillName
                        }) => {
                            const img = document.createElement('img');
                            img.src = `icons/${fileName}`;
                            img.alt = skillName;
                            img.title = skillName;
                            img.classList.add('skill');
                            img.dataset.skillInfo = `${skillClass}:${skillTree}`;
                            img.dataset.skillID = skillID;
                            img.setAttribute('draggable', 'true');
                            skillTable[skillID] = {
                                fileName,
                                skillName,
                                skillClass,
                                skillTree
                            };

                            img.addEventListener('dragstart', () => {
                                draggedImageSrc = img.getAttribute('src');
                                sourceSlot = null;
                                dropSucceeded = false;
                                const skillPool = document.querySelector('.skill-pool');
                                skillPool.style.overflowY = 'hidden';
                            });
                            img.addEventListener('dragend', () => {
                                const skillPool = document.querySelector('.skill-pool');
                                skillPool.style.overflowY = 'auto';
                            });

                            iconContainer.appendChild(img);
                            skillID++;
                        });
                    });
                }
            });
        });
        loadSetupFromURL();
        setRandomFavicon();
    });