import { useState, useMemo, useEffect, useCallback } from 'react';
import { DayPicker } from 'react-day-picker';
import type { Matcher } from 'react-day-picker';
import "react-day-picker/style.css";
import { es } from 'date-fns/locale';
import { format, addDays, startOfDay, isWeekend, isWithinInterval, isSameDay, nextMonday } from 'date-fns';
import { Settings, ChevronLeft, RotateCcw } from 'lucide-react';
import { calculateTimeline } from './lib/calculator';
import { cn } from './lib/utils';
import { ColorPicker } from './components/ColorPicker';
import { REGIONS, initHolidays, isHoliday as checkHoliday } from './lib/holidays';

// UI Components
const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("rounded-xl border bg-card text-card-foreground shadow", className)}>
    {children}
  </div>
);

const Label = ({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) => (
  <label htmlFor={htmlFor} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block mb-2">
    {children}
  </label>
);

const Input = ({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    className={cn(
      "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  />
);

const Select = ({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <div className="relative">
    <select
      className={cn(
        "flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 appearance-none",
        className
      )}
      {...props}
    />
    <ChevronLeft className="absolute right-3 top-3 h-4 w-4 rotate-270 opacity-50 pointer-events-none" />
  </div>
);

const Button = ({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2",
      className
    )}
    {...props}
  />
);

export default function App() {
  const [birthDate, setBirthDate] = useState<Date | undefined>(new Date());
  const [motherWeeks, setMotherWeeks] = useState(17);
  const [fatherWeeks, setFatherWeeks] = useState(17);
  const [lactanciaDays, setLactanciaDays] = useState(15);
  const [vacacionesDays, setVacacionesDays] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Holiday State
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [customHolidays, setCustomHolidays] = useState<Date[]>([]);

  // Colors state
  const [colors, setColors] = useState({
    obligatoria: '#fecaca', // red-200
    madre: '#e9d5ff',      // purple-200
    padre: '#bfdbfe',      // blue-200
    lactancia: '#fbcfe8',  // pink-200
    vacaciones: '#bbf7d0', // green-200
  });

  // Initialize holidays on region change
  useEffect(() => {
    initHolidays(selectedRegion || undefined);
  }, [selectedRegion]);

  const handleReset = () => {
    setBirthDate(new Date());
    setMotherWeeks(17);
    setFatherWeeks(17);
    setLactanciaDays(15);
    setVacacionesDays(0);
    setSelectedRegion("");
    setCustomHolidays([]);
    setColors({
      obligatoria: '#fecaca',
      madre: '#e9d5ff',
      padre: '#bfdbfe',
      lactancia: '#fbcfe8',
      vacaciones: '#bbf7d0',
    });
  };

  // Holiday Check Function
  const isDayHoliday = useCallback((date: Date) => {
    // Check library holidays (National/Regional)
    if (checkHoliday(date)) return true;
    // Check custom local holidays
    return customHolidays.some(d => isSameDay(d, date));
  }, [customHolidays, selectedRegion]); 

  // Calculate timeline
  const timeline = useMemo(() => {
    if (!birthDate) return [];
    return calculateTimeline({
      birthDate,
      motherWeeks,
      fatherWeeks,
      lactanciaDays,
      vacacionesDays,
      isHoliday: isDayHoliday
    });
  }, [birthDate, motherWeeks, fatherWeeks, lactanciaDays, vacacionesDays, isDayHoliday]);

  // Determine last day covered
  const lastPeriod = timeline[timeline.length - 1];
  const guarderiaDate = lastPeriod ? addDays(lastPeriod.end, 1) : birthDate;
  
  const isGuarderiaDateWeekend = guarderiaDate ? isWeekend(guarderiaDate) : false;
  const suggestedStartDate = isGuarderiaDateWeekend && guarderiaDate ? nextMonday(guarderiaDate) : guarderiaDate;

  // DayPicker Modifiers
  const modifiers = useMemo(() => {
    const mods: Record<string, Matcher[]> = {
      nacimiento: birthDate ? [birthDate] : [],
      weekend: [{ dayOfWeek: [0, 6] }],
      holiday: [], // Auto holidays
      customHoliday: customHolidays, // Manual holidays
      obligatoria: [],
      madre: [],
      padre: [],
      lactancia: [],
      vacaciones: []
    };

    mods.holiday.push((date: Date) => checkHoliday(date));

    timeline.forEach(p => {
      const interval = { from: startOfDay(p.start), to: startOfDay(p.end) };
      
      if (p.type === 'baja-obligatoria') mods.obligatoria.push(interval);
      if (p.type === 'baja-madre') mods.madre.push(interval);
      if (p.type === 'baja-padre') mods.padre.push(interval);
      
      // Skip weekends AND holidays for working day leaves
      if (p.type === 'lactancia') {
        mods.lactancia.push((date: Date) => 
          isWithinInterval(date, { start: p.start, end: p.end }) && 
          !isWeekend(date) && 
          !isDayHoliday(date)
        );
      }
      if (p.type === 'vacaciones') {
        mods.vacaciones.push((date: Date) => 
          isWithinInterval(date, { start: p.start, end: p.end }) && 
          !isWeekend(date) &&
          !isDayHoliday(date)
        );
      }
    });

    return mods;
  }, [timeline, birthDate, isDayHoliday, customHolidays]);

  // Custom styles
  const modifiersStyles = {
    obligatoria: { backgroundColor: colors.obligatoria, color: '#000' },
    madre: { backgroundColor: colors.madre, color: '#000' },
    padre: { backgroundColor: colors.padre, color: '#000' },
    lactancia: { backgroundColor: colors.lactancia, color: '#000' },
    vacaciones: { backgroundColor: colors.vacaciones, color: '#000' },
    weekend: { color: '#9ca3af' },
    holiday: { textDecoration: 'line-through', color: '#ef4444', fontWeight: 'bold' },
    customHoliday: { textDecoration: 'line-through', color: '#f97316', fontWeight: 'bold' },
  };

  const modifiersClassNames = {
    nacimiento: 'day-nacimiento relative font-bold border-2 border-red-500 rounded-full',
  };

  // Handlers
  const handleDayClick = (day: Date) => {
    // Toggle custom holiday on click
    const isCustom = customHolidays.some(d => isSameDay(d, day));
    if (isCustom) {
      setCustomHolidays(prev => prev.filter(d => !isSameDay(d, day)));
    } else {
      setCustomHolidays(prev => [...prev, day]);
    }
  };

  const handleColorChange = (key: keyof typeof colors) => (e: React.ChangeEvent<HTMLInputElement> | string) => {
    // Support both event and direct string (from ColorPicker)
    const val = typeof e === 'string' ? e : e.target.value;
    setColors(prev => ({ ...prev, [key]: val }));
  };

  const handleNumberChange = (setter: (v: number) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (val >= 0) setter(val);
  };

  // Determine number of months to show
  const numberOfMonths = useMemo(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) return 1;
    if (!isSidebarOpen) return 8; 
    return 6;
  }, [isSidebarOpen]);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 font-sans">
      <div className="max-w-[1600px] mx-auto space-y-8">
        
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-primary">
            ¿Cuándo empieza la guardería? 👶
          </h1>
          <p className="text-muted-foreground">
            Calcula la fecha óptima combinando bajas, lactancia y vacaciones.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-start">
          
          {/* Sidebar Area */}
          <div className={cn("transition-all duration-300 ease-in-out shrink-0", isSidebarOpen ? "w-full md:w-[280px]" : "w-full md:w-[60px]")}>
            
            {/* Mobile Toggle */}
            <div className="flex justify-between items-center md:hidden mb-4">
               <span className="font-bold">Configuración</span>
               <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 border rounded">
                 {isSidebarOpen ? <ChevronLeft className="h-4 w-4 rotate-90"/> : <Settings className="h-4 w-4"/>}
               </button>
            </div>

            {/* Desktop Collapsed State */}
            {!isSidebarOpen && (
              <div className="hidden md:flex flex-col items-center gap-4 py-4">
                 <Button 
                    onClick={() => setIsSidebarOpen(true)} 
                    className="h-10 w-10 rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90 p-0"
                    title="Expandir configuración"
                  >
                    <Settings className="h-5 w-5" />
                 </Button>
              </div>
            )}
            
            {/* Expanded Card */}
            <Card className={cn(
              "overflow-hidden transition-all duration-300", 
              !isSidebarOpen && "hidden md:hidden", 
              isSidebarOpen && "block"
            )}>
               <div className="p-4 space-y-5 relative">
                 {/* Collapse Button */}
                 <button 
                   onClick={() => setIsSidebarOpen(false)} 
                   className="absolute top-2 right-2 p-1.5 text-muted-foreground hover:bg-muted rounded-md hidden md:flex items-center justify-center transition-colors"
                   title="Minimizar"
                 >
                   <ChevronLeft className="h-4 w-4"/>
                 </button>

                  <div className="flex justify-between items-center border-b pb-3 pr-6">
                    <h2 className="font-semibold text-lg flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Ajustes
                    </h2>
                    <Button onClick={handleReset} className="h-7 w-7 p-0 bg-transparent hover:bg-muted text-foreground" title="Reiniciar">
                      <RotateCcw className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <div>
                    <Label>Fecha de nacimiento</Label>
                    <div className="rounded-md flex justify-center">
                      <Input 
                        type="date" 
                        value={birthDate ? format(birthDate, 'yyyy-MM-dd') : ''}
                        onChange={(e) => e.target.valueAsDate && setBirthDate(e.target.valueAsDate)}
                        className="w-full text-center"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Festivos (Comunidad)</Label>
                    <Select 
                      value={selectedRegion} 
                      onChange={(e) => setSelectedRegion(e.target.value)}
                    >
                      <option value="">Nacional solamente</option>
                      {REGIONS.map(r => (
                        <option key={r.code} value={r.code}>{r.name}</option>
                      ))}
                    </Select>
                    <p className="text-[10px] text-muted-foreground mt-1 leading-tight">
                      * Selecciona tu comunidad para festivos automáticos.
                      <br/>
                      * Haz clic en el calendario para añadir festivos locales (ciudad).
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-medium text-sm text-muted-foreground border-b pb-1">Bajas (Semanas)</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Madre</Label>
                        <Input 
                          type="number" 
                          min={6} 
                          value={motherWeeks} 
                          onChange={handleNumberChange(setMotherWeeks)} 
                          className="w-full text-center"
                        />
                      </div>
                      <div>
                        <Label>Padre</Label>
                        <Input 
                          type="number" 
                          min={6} 
                          value={fatherWeeks} 
                          onChange={handleNumberChange(setFatherWeeks)} 
                          className="w-full text-center"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-medium text-sm text-muted-foreground border-b pb-1">Extras (Días)</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Lactancia</Label>
                        <Input 
                          type="number" 
                          min={0}
                          value={lactanciaDays} 
                          onChange={handleNumberChange(setLactanciaDays)} 
                          className="w-full text-center"
                        />
                      </div>
                      <div>
                        <Label>Vacaciones</Label>
                        <Input 
                          type="number" 
                          min={0}
                          value={vacacionesDays} 
                          onChange={handleNumberChange(setVacacionesDays)} 
                          className="w-full text-center"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <h3 className="font-bold text-sm">Leyenda</h3>
                    <div className="grid grid-cols-1 gap-1.5 text-xs">
                      {[
                        { key: 'obligatoria', label: 'Obligatoria' },
                        { key: 'madre', label: 'Madre' },
                        { key: 'padre', label: 'Padre' },
                        { key: 'lactancia', label: 'Lactancia' },
                        { key: 'vacaciones', label: 'Vacaciones' },
                      ].map(({ key, label }) => (
                        <div key={key} className="flex items-center justify-between group py-0.5">
                          <span className="text-gray-600">{label}</span>
                          <ColorPicker 
                            color={colors[key as keyof typeof colors]} 
                            onChange={handleColorChange(key as keyof typeof colors)} 
                          />
                        </div>
                      ))}
                      <div className="flex items-center justify-between group py-0.5 mt-2 pt-2 border-t">
                         <span className="text-red-500 font-bold">Festivos</span>
                         <span className="text-[10px] text-muted-foreground">(Clic para añadir)</span>
                      </div>
                    </div>
                  </div>
               </div>
            </Card>
          </div>

          {/* Result & Calendar */}
          <div className="flex-1 min-w-0 space-y-6">
            <Card className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
                <div>
                  <h2 className="text-xl font-medium text-muted-foreground">La guardería empieza el:</h2>
                  <div className="flex flex-col">
                    <p className="text-4xl md:text-5xl font-black text-primary mt-2 capitalize">
                      {guarderiaDate ? format(guarderiaDate, 'eeee d MMMM yyyy', { locale: es }) : '...'}
                    </p>
                    {isGuarderiaDateWeekend && suggestedStartDate && (
                      <p className="text-sm text-amber-600 font-medium mt-1">
                        ⚠️ Cae en fin de semana. Inicio probable: {format(suggestedStartDate, 'eeee d MMMM', { locale: es })}.
                      </p>
                    )}
                  </div>
                </div>
                {birthDate && guarderiaDate && (
                  <div className="bg-muted/50 p-4 rounded-lg border">
                    <div className="text-sm text-muted-foreground">Cobertura total</div>
                    <div className="text-2xl font-bold">
                       {Math.floor((guarderiaDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 7))} semanas
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-4 flex justify-center overflow-x-auto min-h-[400px]">
              <DayPicker
                mode="single" // Reverted to single or undefined if interaction is purely handled by onDayClick custom logic, but "single" works for types
                selected={undefined} // No actual selection
                locale={es}
                key={`calendar-${isSidebarOpen}-${birthDate?.toISOString()}-${selectedRegion}-${customHolidays.length}`}
                defaultMonth={birthDate}
                numberOfMonths={numberOfMonths}
                modifiers={modifiers}
                modifiersStyles={modifiersStyles}
                modifiersClassNames={modifiersClassNames}
                onDayClick={handleDayClick}
                className="mx-auto" 
              />
            </Card>

            <div className="space-y-4">
              <div className="text-xs text-center text-muted-foreground">
                * Los periodos de lactancia y vacaciones saltan fines de semana y festivos (extienden la fecha final).
                <br/>
                * Los festivos nacionales y autonómicos se calculan automáticamente. Añade los locales haciendo clic.
              </div>
              
              <div className="bg-muted/30 p-4 rounded-md text-sm text-muted-foreground border">
                <p className="font-semibold mb-1 text-foreground">ℹ️ Información sobre Permisos por Provincia/Comunidad:</p>
                <ul className="list-disc list-inside space-y-1 ml-1">
                  <li><strong>Sector Privado:</strong> La duración es uniforme en toda España (19 semanas total en 2026). No hay diferencias por provincia.</li>
                  <li><strong>Sector Público (Funcionarios):</strong> Algunas Comunidades (ej. País Vasco, Andalucía) pueden ofrecer semanas adicionales. Si es tu caso, simplemente incrementa manualmente el número de semanas en el formulario.</li>
                  <li><strong>País Vasco:</strong> Existen ayudas económicas específicas que permiten extender la excedencia, aunque la baja oficial es la misma.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
