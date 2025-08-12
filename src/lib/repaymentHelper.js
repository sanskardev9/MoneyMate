import { supabase } from './supabase';

// Helper function to log a repayment as an expense
export const logRepayment = async (amount, source, notes = '') => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // First, ensure "Repayments" category exists
    const { data: existingCategory } = await supabase
      .from('budget_categories')
      .select('id')
      .eq('user_id', user.id)
      .eq('name', 'Repayments')
      .single();

    let categoryId;
    
    if (!existingCategory) {
      // Create Repayments category if it doesn't exist
      const { data: newCategory, error: createError } = await supabase
        .from('budget_categories')
        .insert([{
          user_id: user.id,
          name: 'Repayments',
          amount: 0 // Repayments category doesn't need allocation
        }])
        .select('id')
        .single();
      
      if (createError) throw createError;
      categoryId = newCategory.id;
    } else {
      categoryId = existingCategory.id;
    }

    // Log the repayment as an expense
    const { error } = await supabase
      .from('expenses')
      .insert([{
        user_id: user.id,
        amount: amount,
        category_id: categoryId,
        description: notes || `Repayment to ${source}`,
        date: new Date().toISOString().split('T')[0]
      }]);

    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error logging repayment:', error);
    return { success: false, error: error.message };
  }
};

// Helper function to get upcoming repayments
export const getUpcomingRepayments = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('incomes')
      .select('amount, source, due_date, created_at')
      .eq('user_id', user.id)
      .eq('type', 'borrowed')
      .gte('due_date', new Date().toISOString().split('T')[0])
      .order('due_date', { ascending: true });

    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching upcoming repayments:', error);
    return [];
  }
};

// Helper function to calculate days until due
export const getDaysUntilDue = (dueDate) => {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Helper function to get repayment status
export const getRepaymentStatus = (dueDate) => {
  const daysUntilDue = getDaysUntilDue(dueDate);
  
  if (daysUntilDue < 0) {
    return { status: 'overdue', days: Math.abs(daysUntilDue) };
  } else if (daysUntilDue <= 7) {
    return { status: 'urgent', days: daysUntilDue };
  } else if (daysUntilDue <= 30) {
    return { status: 'upcoming', days: daysUntilDue };
  } else {
    return { status: 'future', days: daysUntilDue };
  }
}; 