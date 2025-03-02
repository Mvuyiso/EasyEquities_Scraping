import os
import json
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from easy_equities_client.clients import EasyEquitiesClient
from easy_equities_client.instruments.types import Period

# Initialize the client
client = None

def get_client():
    """Get or initialize the EasyEquities client"""
    global client
    if client is None:
        client = EasyEquitiesClient()
        # Get credentials from environment variables
        username = os.getenv("EASYEQUITIES_USERNAME")
        password = os.getenv("EASYEQUITIES_PASSWORD")
        
        if not username or not password:
            raise ValueError("EASYEQUITIES_USERNAME and EASYEQUITIES_PASSWORD must be set in environment variables")
        
        # Login to Easy Equities
        client.login(username=username, password=password)
    
    return client

@api_view(['GET'])
def accounts_list(request):
    """Get a list of all accounts"""
    try:
        client = get_client()
        accounts = client.accounts.list()
        
        # Convert accounts to JSON-serializable format
        accounts_data = []
        for account in accounts:
            account_data = {
                'id': account.id,
                'name': account.name,
                'trading_currency_id': account.trading_currency_id
            }
            
            # Try to get summary information for the account
            try:
                client.accounts._switch_account(account.id)
                valuations = client.accounts.valuations(account.id)
                holdings = client.accounts.holdings(account.id)
                
                account_data['summary'] = {
                    'total_value': valuations.get('TopSummary', {}).get('TotalValue', 'N/A'),
                    'available_cash': valuations.get('TopSummary', {}).get('AvailableCash', 'N/A'),
                    'holdings_count': len(holdings)
                }
            except Exception as e:
                # If we can't get summary info, just continue
                pass
                
            accounts_data.append(account_data)
            
        return Response(accounts_data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def dashboard(request, account_id):
    """Get dashboard data for an account"""
    try:
        client = get_client()
        
        # Get holdings
        holdings = client.accounts.holdings(account_id)
        
        # Calculate total values
        total_purchase_value = 0
        total_current_value = 0
        
        # Process holdings
        processed_holdings = []
        for holding in holdings:
            # Extract values
            purchase_value = float(holding['purchase_value'][1:].replace(' ', ''))
            current_value = float(holding['current_value'][1:].replace(' ', ''))
            profit_loss = current_value - purchase_value
            profit_loss_percentage = (profit_loss / purchase_value * 100) if purchase_value > 0 else 0
            
            # Add to totals
            total_purchase_value += purchase_value
            total_current_value += current_value
            
            # Add processed holding
            processed_holdings.append({
                'name': holding['name'],
                'purchase_value': holding['purchase_value'],
                'current_value': holding['current_value'],
                'profit_loss': profit_loss,
                'profit_loss_percentage': profit_loss_percentage
            })
        
        # Calculate total profit/loss
        total_profit_loss = total_current_value - total_purchase_value
        total_profit_loss_percentage = (total_profit_loss / total_purchase_value * 100) if total_purchase_value > 0 else 0
        
        # Get currency symbol
        currency = holdings[0]['purchase_value'][0] if holdings else 'R'
        
        # Sort holdings by profit/loss percentage to get top performers
        top_performers = sorted(processed_holdings, key=lambda h: h['profit_loss_percentage'], reverse=True)[:5]
        
        dashboard_data = {
            'total_value': f"{currency}{total_current_value:.2f}",
            'total_profit_loss_value': f"{currency}{total_profit_loss:.2f}",
            'total_profit_loss_percentage': total_profit_loss_percentage,
            'holdings': processed_holdings,
            'top_performers': top_performers
        }
        
        return Response(dashboard_data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def holdings(request, account_id):
    """Get holdings for an account"""
    try:
        client = get_client()
        holdings = client.accounts.holdings(account_id)
        return Response(holdings)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def transactions(request, account_id):
    """Get transactions for an account"""
    try:
        client = get_client()
        transactions = client.accounts.transactions(account_id)
        return Response(transactions)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def profit_loss(request, account_id):
    """Get profit/loss data for an account"""
    try:
        client = get_client()
        
        # Get holdings
        holdings = client.accounts.holdings(account_id)
        
        # Calculate profit/loss for each holding
        processed_holdings = []
        total_investment = 0
        total_current_value = 0
        
        for holding in holdings:
            # Extract values
            purchase_value = float(holding['purchase_value'][1:].replace(' ', '').replace(',', ''))
            current_value = float(holding['current_value'][1:].replace(' ', '').replace(',', ''))
            profit_loss = current_value - purchase_value
            profit_loss_percentage = (profit_loss / purchase_value * 100) if purchase_value > 0 else 0
            
            # Add to totals
            total_investment += purchase_value
            total_current_value += current_value
            
            # Add processed holding
            processed_holdings.append({
                'name': holding['name'],
                'purchase_value': purchase_value,
                'current_value': current_value,
                'profit_loss': profit_loss,
                'profit_loss_percentage': profit_loss_percentage
            })
        
        # Calculate total profit/loss
        total_profit_loss = total_current_value - total_investment
        total_profit_loss_percentage = (total_profit_loss / total_investment * 100) if total_investment > 0 else 0
        
        # Get currency symbol
        currency = holdings[0]['purchase_value'][0] if holdings else 'R'
        
        profit_loss_data = {
            'holdings': processed_holdings,
            'total_investment': total_investment,
            'total_current_value': total_current_value,
            'total_profit_loss': total_profit_loss,
            'total_profit_loss_percentage': total_profit_loss_percentage,
            'currency': currency
        }
        
        return Response(profit_loss_data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def all_holdings(request):
    """Get all holdings across all accounts"""
    try:
        client = get_client()
        accounts = client.accounts.list()
        
        all_holdings = []
        for account in accounts:
            try:
                holdings = client.accounts.holdings(account.id)
                for holding in holdings:
                    all_holdings.append({
                        'name': holding['name'],
                        'contract_code': holding.get('contract_code', ''),
                        'account_name': account.name,
                        'account_id': account.id
                    })
            except Exception:
                # If we can't get holdings for an account, just continue
                pass
        
        # Remove duplicates based on contract_code
        unique_holdings = []
        seen_codes = set()
        for holding in all_holdings:
            if holding['contract_code'] and holding['contract_code'] not in seen_codes:
                seen_codes.add(holding['contract_code'])
                unique_holdings.append(holding)
        
        return Response(unique_holdings)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def historical_prices(request, contract_code, period):
    """Get historical prices for an instrument"""
    try:
        client = get_client()


        # Convert period string to Period enum
        try:
            period_enum = Period[period.upper()]
        except KeyError:
            return Response(
                {'error': f'Invalid period. Choose from: {", ".join(p.name for p in Period)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get historical prices
        prices = client.instruments.historical_prices(contract_code, period_enum)
        return Response(prices)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
