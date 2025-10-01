Environment setup
To start working with Tolk, you need a development environment.

We recommend using Blueprint, a tool for writing, testing, and deploying smart contracts on TON.

Create a new TON project
Prerequisite: Node.js v16 or higher

Create a new TON project:
npm create ton@latest

Enter any project name and select "A simple counter contract (Tolk)" when prompted by Blueprint.
Project structure
Here's a quick look at the typical project layout:

my-first-contract/
├── build/             # Compiled smart contract bytecode
├── contracts/         # Smart contract sources (e.g., counter.tolk)
├── scripts/           # TypeScript deployment scripts
├── tests/             # TypeScript tests
├── wrappers/          # TypeScript wrappers for contracts

Build the project
npx blueprint build
# or
yarn blueprint build

Blueprint compiles the contract and displays the resulting bytecode, along with its hash. The output is saved in the build/ directory.

Run tests
npx blueprint test
# or
yarn blueprint test

This runs unit tests from the tests/ directory.

Deploy or run a script
npx blueprint run
# or
yarn blueprint run

Use this command to deploy your contract to Mainnet, Testnet, or MyLocalTon.

Skip to main content
TON
Concepts
Guidelines
Documentation
English

Introduction
Smart contracts
Introduction
Development environment
Addresses

Message management
Transaction fees
Sharding
Parameters & limits
Contracts specification
Tolk language
Tolk language overview
Environment setup
Simple counter contract
Language guide
Tolk vs FunC: in short
Tolk vs FunC: in detail
Tolk vs FunC: mutability
Tolk vs FunC: standard library
Auto packing to/from cells
Universal createMessage
The magic lazy
History of Tolk
FunC language
Overview
FunC cookbook
Documentation
Libraries
History of FunC
Fift language
Tact language
DApps
Nodes
Infrastructure
Network
Data formats
Virtual machine
Whitepapers
FAQ
Language guide
Table of contents
Basic syntax
Functions
Variables and types
Control flow
Type system
Error handling
Structures
Methods
Enums
Imports and modules
Advanced features
Standard library
Basic syntax
Comments
Tolk uses traditional C-style syntax for comments:

// Single-line comment

/* 
   Multi-line comment
   can span multiple lines
*/

Identifiers
Identifiers must start with [a-zA-Z$_] — that is, a letter, underscore, or dollar sign — and may continue with characters from [a-zA-Z0-9$_].

As in most programming languages, camelCase is the preferred naming convention.

var justSomeVariable = 123;

Functions
Function declaration
Use the fun keyword with TypeScript-like syntax:

fun functionName(param1: type1, param2: type2): returnType {
    // function body
}

Examples:

fun parseData(cs: slice): cell { }
fun loadStorage(): (cell, int) { }
fun main() { ... }

If the return type is omitted, it's auto-inferred.

Generic functions
Tolk supports generic functions:

fun swap<T1, T2>(a: T1, b: T2): (T2, T1) {
    return (b, a);
}

Default parameters
Function parameters can have default values:

fun increment(x: int, by: int = 1): int {
    return x + by;
}

GET methods
Contract getters use the get fun syntax:

get fun seqno(): int {
    return 1;
}

Variables and types
Variable declaration
Declare variables with var for mutable variables and val for immutable ones:

var mutableVar: int = 10;
val immutableVar: int = 20;

Type annotations are optional for local variables:

var i = 10; // int inferred
var b = beginCell(); // builder inferred

Variable scope
Variables cannot be redeclared within the same scope:

var a = 10;
var a = 20; // Error! Use: a = 20;

if (true) {
    var a = 30; // OK, different scope
}

Control flow
Conditional statements
if (condition) {
    // code
} else if (anotherCondition) {
    // code
} else {
    // code
}

Loops
While loop
while (condition) {
    // code
}

Do-while loop
do {
    // code
} while (condition);

Repeat loop
repeat (10) {
    // body
}

Type system
Basic types
int - integer; fixed-width variants like int32 and uint64 are also supported
bool - boolean (true/false). Note: in TVM, true is represented as -1, not 1
cell - a TVM cell
slice - a TVM slice; you can also use bitsN. (e.g. bits512 for storing a signature)
builder - a TVM builder
address - blockchain address
coins - Toncoin or coin amounts
void - no return value
never - function never returns (always throws an exception)
Fixed-width integers
var smallInt: int32 = 42;
var bigInt: uint64 = 1000000;

Boolean type
The Boolean type is distinct from integers:

var valid: bool = true;
var result: bool = (x > 0);

if (valid) { // accepts bool
    // code
}

// Cast to int if needed
var intValue = valid as int; // -1 for true, 0 for false

Nullable types
Nullable types are denoted by ?:

var maybeInt: int? = null;
var maybeCell: cell? = someCell;

if (maybeInt != null) {
    // Smart cast: maybeInt is now int
    var result = maybeInt + 5;
}

Union types
Union types allow a value to have multiple possible types. Typically, you handle them using match by type:

fun processValue(value: int | slice) {
    match (value) {
        int => {
            // Got integer
        }
        slice => {
            // Got slice
        }
    }
}

Alternatively, you can test a union value using the is or !is operators:

fun processValue(value: int | slice) {
    if (value is slice) {
        // call methods for slice
        return;
    }
    // value is int
    return value * 2;
}

Tuple types
Tuples with explicit types:

var data: [int, slice, bool] = [42, mySlice, true];

Tensor types
Tensors are similar to tuples but stored on the stack:

var coords: (int, int) = (10, 20);
var x = coords.0; // Access first element
var y = coords.1; // Access second element

Type aliases
Create aliases to improve code clarity:

type UserId = int32
type MaybeOwnerHash = bits256?

fun calcHash(id: UserId): MaybeOwnerHash { ... }

Address type
A dedicated type for blockchain addresses:

val addr = address("EQDKbjIcfM6ezt8KjKJJLshZJJSqX7XOA4ff-W72r5gqPrHF");

if (addr.isInternal()) {
    var workchain = addr.getWorkchain();
}

Tensors
Indexed access
Access elements using dot . notation:

var t = (5, someSlice, someBuilder);
t.0 = 10; // Modify first element
t.1; // Access second element

Tuples
var t = [5, someSlice, someBuilder];
t.0 = 10; // asm "SETINDEX"
var first = t.0; // asm "INDEX"

Error handling
Throw and assert
Simplified error handling:

throw 404; // Throw exception with code
throw (404, "Not found"); // Throw with data

assert (condition) throw 404; 
assert (!condition) throw 404;

Try-catch
try {
    riskyOperation();
} catch (excNo, arg) {
    // Handle exception
}

Structures
Struct declaration
struct Point {
    x: int
    y: int
}

Creating objects
var p: Point = { x: 10, y: 20 };
var p2 = Point { x: 5, y: 15 };

Default values
struct Config {
    timeout: int = 3600
    enabled: bool = true
}

var config: Config = {}; // Uses defaults

Generic structures
struct Container<T> {
    value: T
    isEmpty: bool
}

var intContainer: Container<int> = { value: 42, isEmpty: false };

Field modifiers
private field — accessible only within methods
readonly field — immutable after object creation
struct PosInTuple {
    private readonly t: tuple
    curIndex: int
}

fun PosInTuple.last(mutate self) {
    // `t` is visible only in methods
    // and can not be modified
    self.curIndex = self.t.size() - 1;
}

Methods
Instance methods
Methods are implemented as extension functions that accept self:

fun Point.distanceFromOrigin(self): int {
    return sqrt(self.x * self.x + self.y * self.y);
}

Mutating methods
Use the mutate keyword for methods that modify the receiver:

fun Point.moveBy(mutate self, dx: int, dy: int) {
    self.x += dx;
    self.y += dy;
}

Methods for any type
fun int.isZero(self) {
    return self == 0;
}

fun T.copy(self): T {
    return self;
}

Chaining methods
Methods can return self to enable method chaining:

fun builder.storeInt32(mutate self, value: int32): self {
    return self.storeInt(value, 32);
}

Enums
// will be 0 1 2
enum Color {
    Red
    Green
    Blue
}

They are:

similar to TypeScript/C++ enums
distinct type, not just int
checked on deserialization
allowed in throw and assert
Enums syntax
Enum members can be separated by , or by ; or by a newline — like struct fields.

Like in TypeScript and C++, you can manually specify a value, the following will be auto-calculated.

enum Mode {
    Foo = 256,
    Bar,        // implicitly 257
}

Enums usage: they are distinct types
Since enums are types, you can

declare variables and parameters
declare methods for an enum
use them in struct fields, in unions, in generics, etc.
struct Gradient {
    from: Color
    to: Color? = null
}

fun Color.isRed(self) {
    return self == Color.Red
}

var g: Gradient = { from: Color.Blue };
g.from.isRed();       // false

Enums are integers under the hood. They can be cast to int and back with as operator.

Serialization of enums
You can manually specify :intN. Otherwise, the compiler will auto-calculate it.

// will be (un)packed as `int8`
enum Role1: int8 { Admin, User, Guest }

// will (un)packed as `uint2` (auto-calculated to fit all values)
enum Color { Red, Green, Blue }

On deserialization, an input value is checked for correctness. E.g., for Role, if input<0 or input>2, an exception "5 (integer out of range)" will be thrown.

Imports and modules
Import syntax
import "another"
import "@stdlib/gas-payments"

Advanced features
TVM assembler functions
You can implement functions directly in TVM assembler:

@pure
fun third<X>(t: tuple): X 
    asm "THIRD"

Function attributes
Functions can have attributes using the @ syntax:

@inline
fun fastFunction() {}

@inline_ref
fun load_data() {}

@deprecated
fun oldFunction() {}

@method_id(1666)
fun afterCodeUpgrade(oldCode: continuation) {}

Trailing commas
Tolk supports trailing commas in tensors, tuples, function calls, and parameters:

var items = (
    totalSupply,
    verifiedCode,
    validatorsList,
);

Optional semicolons
Semicolons are optional for the last statement in a block:

fun f() {
    doSomething();
    return result // Valid without semicolon
}

Semicolons are also optional for top-level declarations such as constants, type aliases, and struct fields.

Compile-time functions
String-processing functions execute at compile time:

const BASIC_ADDR = address("EQDKbjIcfM6ezt8KjKJJLshZJJSqX7XOA4ff-W72r5gqPrHF");
const HASH = stringSha256_32("transfer(slice, int)");


Available compile-time functions include: stringCrc32, stringCrc16, stringSha256, stringSha256_32, stringHexToSlice, and stringToBase256.

Toncoin amounts
Use human-readable Toncoin amounts:

val cost = ton("0.05"); // 50,000,000 nanotons
const ONE_TON = ton("1");

Smart casts
Automatic type narrowing:

if (value != null) {
    // value is automatically cast from T? to T
    value.someMethod();
}

Non-null assertion
Use ! when you are sure a value is not null:

fun processCell(maybeCell: cell?) {
    if (hasCell) {
        processCell(maybeCell!); // bypass nullability check
    }
}

Auto-packing
Structures can be automatically packed to and unpacked from cells:

struct Point {
    x: int8
    y: int8
}

var point: Point = { x: 10, y: 20 };
var cell = point.toCell(); // Auto-pack
var restored = Point.fromCell(cell); // Auto-unpack

Deep dive: Auto-packing.

"Lazy loading" from cells: unpack only requested fields
val st = lazy Storage.load();
// the compiler skips everything and loads only what you access
return st.publicKey;

Deep dive: Lazy loading.

Universal message composition
Create messages using a high-level syntax:

val reply = createMessage({
    bounce: false,
    value: ton("0.05"),
    dest: senderAddress,
    body: RequestedInfo { ... }
});
reply.send(SEND_MODE_REGULAR);

Deep dive: Sending messages.

Standard library
Common functions are available by default:

// Common functions always available
var time = blockchain.logicalTime();

While more specific ones require importing (IDE suggests you):

import "@stdlib/gas-payments"

var fee = calculateStorageFee(...);

Was this article useful?

Yes

No
Edit this page
Last updated on Sep 19, 2025 by tolk-vm
Previous
Simple counter contract
Next
Tolk vs FunC: in short
Table of contents
Basic syntax
Comments
Identifiers
Functions
Function declaration
Generic functions
Default parameters
GET methods
Variables and types
Variable declaration
Variable scope
Control flow
Conditional statements
Loops
Type system
Basic types
Fixed-width integers
Boolean type
Nullable types
Union types
Tuple types
Tensor types
Type aliases
Address type
Tensors
Indexed access
Tuples
Error handling
Throw and assert
Try-catch
Structures
Struct declaration
Creating objects
Default values
Generic structures
Field modifiers
Methods
Instance methods
Mutating methods
Methods for any type
Chaining methods
Enums
Enums syntax
Enums usage: they are distinct types
Serialization of enums
Imports and modules
Import syntax
Advanced features
TVM assembler functions
Function attributes
Trailing commas
Optional semicolons
Compile-time functions
Toncoin amounts
Smart casts
Non-null assertion
Auto-packing
"Lazy loading" from cells: unpack only requested fields
Universal message composition
Standard library
Use
Get a Wallet
Get Toncoin
Stake
Accept Payments
Apps & Services
Domains
USDT on TON
Cross-Chain Bridges
Learn
TON Concept
Decentralized Network
Roadmap
TonStat
History of Mining
Toncoin
Validators
White Paper
Brand Assets
Sustainability
For Builders
TON Builders Portal
Getting Started
Documentation
Telegram Mini Apps
Dev Chats
Bug Bounty
Find a Job
Find a Talent
Use Cases
GameFi
Memecoins & Tokens
Community Tools
TON Sites
Community
Communities
Blog
Careers
