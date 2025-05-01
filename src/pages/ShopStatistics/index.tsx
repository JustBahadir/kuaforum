
// Update the TabsContent components to use conditional rendering instead of forceMount:
<TabsContent value="daily" className="m-0">
  {currentView === 'daily' && <DailyView dateRange={dateRange} />}
</TabsContent>
<TabsContent value="weekly" className="m-0">
  {currentView === 'weekly' && <WeeklyView dateRange={dateRange} />}
</TabsContent>
<TabsContent value="monthly" className="m-0">
  {currentView === 'monthly' && <MonthlyView dateRange={dateRange} />}
</TabsContent>
<TabsContent value="yearly" className="m-0">
  {currentView === 'yearly' && <YearlyView dateRange={dateRange} />}
</TabsContent>
