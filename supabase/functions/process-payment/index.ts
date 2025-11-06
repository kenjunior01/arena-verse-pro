import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { tournamentId, userId, amount, paymentMethod, transactionId } = await req.json()

    console.log('Processing payment:', { tournamentId, userId, amount, paymentMethod })

    // Insert payment record
    const { data: payment, error: paymentError } = await supabaseClient
      .from('payments')
      .insert({
        tournament_id: tournamentId,
        user_id: userId,
        amount: amount,
        currency: 'USD',
        payment_method: paymentMethod,
        transaction_id: transactionId,
        status: 'completed'
      })
      .select()
      .single()

    if (paymentError) throw paymentError

    // Create notification
    await supabaseClient
      .from('notifications')
      .insert({
        user_id: userId,
        type: 'payment',
        title: 'Pagamento Confirmado',
        message: `Seu pagamento de $${amount} foi processado com sucesso!`,
        link: `/tournaments/${tournamentId}`
      })

    console.log('Payment processed successfully:', payment)

    return new Response(
      JSON.stringify({ success: true, payment }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Payment processing error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})