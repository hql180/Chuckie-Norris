
//Vector2 basic tests
//NOTE: These aren't too extensive, they are just some basic checks.

function test(check, expected) {
	var val = eval(check);
	document.writeln("<p>" + check + " " + (val == expected ? "SUCCESS" : "FAILED") + "</p>");
	document.writeln("<p>Expected: " + expected + "</p>");
	document.writeln("<p>Result: " + val + "</p>");
}

try {

	test("typeof(Vector2) == 'function'", true);

	var a = new Vector2();
	a.set(2, 3);

	test("a.x", 2);
	test("a.y", 3);

	var b = new Vector2();
	b.set(7, 3);

	a.add(b);
	test("a.x", 9);
	test("a.y", 6);

	b.sub(a);
	test("b.x", -7);
	test("b.y", -3);

	var c = new Vector2();
	c.set(0, -10000);
	c.normalize();

	test("c.x", 0);
	test("c.y", -1);
	
	document.writeln("All tests complete.");

} catch (ex) {
	document.writeln("Error before test code could finish: " + ex);
}
