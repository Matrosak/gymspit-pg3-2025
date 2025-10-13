using System;

class Program
{
    static void Main()
    {
        Console.Write("Zadej první číslo: ");
        double a = Convert.ToDouble(Console.ReadLine());

        Console.Write("Zadej operaci (+, -, *, /): ");
        char op = Console.ReadKey().KeyChar;
        Console.WriteLine();

        Console.Write("Zadej druhé číslo: ");
        double b = Convert.ToDouble(Console.ReadLine());

        double vysledek = 0;

        if (op == '+') vysledek = a + b;
        else if (op == '-') vysledek = a - b;
        else if (op == '*') vysledek = a * b;
        else if (op == '/') vysledek = a / b;
        else Console.WriteLine("Neplatná operace!");

        Console.WriteLine("Výsledek: " + vysledek);
    }
}
