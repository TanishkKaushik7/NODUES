import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";
import { buttonVariants } from "../../components/ui/button";

function Calendar({
  className,
  selected,
  onSelect,
  month,
  onMonthChange,
  showOutsideDays = true,
  ...props
}) {
  const [currentMonth, setCurrentMonth] = React.useState(month || new Date());
  
  const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };
  
  const handlePrevMonth = () => {
    const prevMonth = new Date(currentMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    setCurrentMonth(prevMonth);
    onMonthChange?.(prevMonth);
  };
  
  const handleNextMonth = () => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setCurrentMonth(nextMonth);
    onMonthChange?.(nextMonth);
  };
  
  const handleDayClick = (day) => {
    const selectedDate = new Date(currentMonth);
    selectedDate.setDate(day);
    onSelect?.(selectedDate);
  };
  
  const renderDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const daysArray = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      daysArray.push(<div key={`empty-${i}`} className="h-9 w-9" />);
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = selected && selected.getDate() === day && 
                        selected.getMonth() === currentMonth.getMonth() && 
                        selected.getFullYear() === currentMonth.getFullYear();
      
      daysArray.push(
        <button
          key={`day-${day}`}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "h-9 w-9 p-0 font-normal",
            isSelected && "bg-primary text-primary-foreground hover:bg-primary"
          )}
          onClick={() => handleDayClick(day)}
        >
          {day}
        </button>
      );
    }
    
    return daysArray;
  };
  
  return (
    <div className={cn("p-3", className)} {...props}>
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevMonth}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="text-sm font-medium">
            {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </div>
          <button
            onClick={handleNextMonth}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
            )}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between">
            {days.map(day => (
              <div key={day} className="text-muted-foreground w-9 text-center text-[0.8rem] font-normal">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {renderDays()}
          </div>
        </div>
      </div>
    </div>
  );
}
Calendar.displayName = "Calendar";

export { Calendar };