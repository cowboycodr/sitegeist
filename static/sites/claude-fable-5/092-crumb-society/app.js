(() => {
	"use strict";

	const bar = document.getElementById("box-bar");
	const status = document.getElementById("box-status");
	const clearButton = document.getElementById("box-clear");
	const reserveButton = document.getElementById("box-reserve");

	const box = new Map(); // name -> { count, price }

	const presets = {
		quiet: [
			["Rye Croissant", 5.5, 2],
			["Quiet Loaf", 8.0, 1],
		],
		ritual: [
			["Rye Croissant", 5.5, 1],
			["Damson Danish", 6.0, 1],
			["Buckwheat Canelé", 4.75, 1],
			["Miso Morning Bun", 5.25, 1],
			["Apricot Galette", 6.5, 1],
			["Quiet Loaf", 8.0, 1],
		],
		committee: [
			["Damson Danish", 6.0, 3],
			["Apricot Galette", 6.5, 3],
			["Miso Morning Bun", 5.25, 3],
			["Buckwheat Canelé", 4.75, 3],
		],
	};

	const money = (value) => "$" + value.toFixed(2);

	const render = (message) => {
		let count = 0;
		let total = 0;
		for (const item of box.values()) {
			count += item.count;
			total += item.count * item.price;
		}
		if (count === 0) {
			bar.hidden = true;
			status.textContent = message || "Your box is empty.";
			return;
		}
		bar.hidden = false;
		const pieces = count === 1 ? "1 pastry" : count + " pastries";
		status.textContent = message || "In your box: " + pieces + " — " + money(total) + ".";
	};

	const add = (name, price, count = 1) => {
		const entry = box.get(name) || { count: 0, price };
		entry.count += count;
		box.set(name, entry);
	};

	document.querySelectorAll("button.add").forEach((button) => {
		button.addEventListener("click", () => {
			add(button.dataset.name, Number(button.dataset.price));
			render();
			button.classList.add("added");
			window.setTimeout(() => button.classList.remove("added"), 450);
		});
	});

	document.querySelectorAll("button.preset").forEach((button) => {
		button.addEventListener("click", () => {
			box.clear();
			for (const [name, price, count] of presets[button.dataset.preset]) {
				add(name, price, count);
			}
			render();
			bar.hidden = false;
			status.textContent += " Adjust it from today's bake above.";
		});
	});

	clearButton.addEventListener("click", () => {
		box.clear();
		bar.hidden = true;
		render();
	});

	reserveButton.addEventListener("click", () => {
		let count = 0;
		for (const item of box.values()) count += item.count;
		const pieces = count === 1 ? "1 pastry" : count + " pastries";
		status.textContent =
			"Reserved: " + pieces + " under the name at the counter. Collect before noon — after that, the crumbs decide.";
	});
})();
