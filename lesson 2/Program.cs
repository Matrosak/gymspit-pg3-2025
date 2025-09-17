using System;

class Program
{
    int Run()
    {
        int score = 0;

        Console.Write("Jaké je hlavní město Česka? ");
        string odpoved1 = Console.ReadLine();
        if (odpoved1.Trim().ToLower() == "praha") { Console.WriteLine("✅ Správně!"); score++; }
        else { Console.WriteLine("❌ Správně je Praha."); }

        Console.Write("Jaké je hlavní město Slovenska? ");
        string odpoved2 = Console.ReadLine();
        if (odpoved2.Trim().ToLower() == "bratislava") { Console.WriteLine("✅ Správně!"); score++; }
        else { Console.WriteLine("❌ Správně je Bratislava."); }

        Console.Write("Jaké je hlavní město Francie? ");
        string odpoved3 = Console.ReadLine();
        if (odpoved3.Trim().ToLower() == "paříž") { Console.WriteLine("✅ Správně!"); score++; }
        else { Console.WriteLine("❌ Správně je Paříž."); }

        Console.Write("Jaké je hlavní město Německa? ");
        string odpoved4 = Console.ReadLine();
        if (odpoved4.Trim().ToLower() == "berlín") { Console.WriteLine("✅ Správně!"); score++; }
        else { Console.WriteLine("❌ Správně je Berlín."); }

        Console.WriteLine($"\nHotovo! Výsledek: {score}/4");
        return score;
    }

    public static int Main()
    {
        return new Program().Run();
    }
}