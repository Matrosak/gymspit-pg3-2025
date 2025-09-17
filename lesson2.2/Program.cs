//napis program, co nacte dve cisla a vypise jejich soucet, rozdil, soucin a podil a dalsi
using System;
Console.WriteLine("Zadejte první číslo:");
double num1 = Convert.ToDouble(Console.ReadLine());
Console.WriteLine("Zadejte druhé číslo:");
double num2 = Convert.ToDouble(Console.ReadLine());
double sum = num1 + num2;
double difference = num1 - num2;
double product = num1 * num2;
double quotient = num1 / num2;
Console.WriteLine($"Součet: {sum}");
Console.WriteLine($"Rozdíl: {difference}");
Console.WriteLine($"Součin: {product}");
Console.WriteLine($"Podíl: {quotient}");
Console.WriteLine($"Průměr: {(num1 + num2) / 2}");
Console.WriteLine($"Větší číslo: {Math.Max(num1, num2)}");
Console.WriteLine($"Menší číslo: {Math.Min(num1, num2)}");
Console.WriteLine($"Absolutní hodnota rozdílu: {Math.Abs(difference)}");
Console.WriteLine($"Čtverec prvního čísla: {Math.Pow(num1, 2)}");
Console.WriteLine($"Čtverec druhého čísla: {Math.Pow(num2, 2)}");
Console.WriteLine($"Krychle prvního čísla: {Math.Pow(num1, 3)}");
Console.WriteLine($"Krychle druhého čísla: {Math.Pow(num2, 3)}");
Console.WriteLine($"První číslo zaokrouhlené: {Math.Round(num1)}");
Console.WriteLine($"Druhé číslo zaokrouhlené: {Math.Round(num2)}");
Console.WriteLine($"První číslo na dvě desetinná místa: {Math.Round(num1, 2)}");
Console.WriteLine($"Druhé číslo na dvě desetinná místa: {Math.Round(num2, 2)}");
Console.WriteLine($"První číslo jako celé číslo: {Convert.ToInt32(num1)}");
Console.WriteLine($"Druhé číslo jako celé číslo: {Convert.ToInt32(num2)}");
Console.WriteLine($"První číslo jako celé číslo (odříznutí): {Math.Truncate(num1)}");
Console.WriteLine($"Druhé číslo jako celé číslo (odříznutí): {Math.Truncate(num2)}");
Console.WriteLine("Hotovo!");

// This is a simple calculator program that performs various arithmetic operations and displays the results.
// It reads two numbers from the user and calculates their sum, difference, product, quotient, average, maximum, minimum, absolute difference, squares, cubes, rounded values, and integer conversions.
// The program uses the System namespace for input/output and mathematical functions.
// The program ends with a "Hotovo!" message indicating completion.
// The code is written in C# and is intended to be run in a .NET environment.
// The program handles basic error checking by assuming valid numeric input from the user.
// The program can be extended with additional features such as error handling for non-numeric input, support for more complex mathematical operations, or a user interface for better interaction.
// The program is structured in a linear fashion, making it easy to follow and understand.
// The program can be compiled and executed using a C# compiler or an IDE that supports C# development.
// The program is designed to be simple and educational, demonstrating basic programming concepts such as input/output, data types, and arithmetic operations.

